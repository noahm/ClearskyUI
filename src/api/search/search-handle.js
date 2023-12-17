// @ts-check
/// <reference path="../../types.d.ts" />

import { isPromise } from '..';
import { performSearchOverBuckets } from './perform-search-over-buckets';

/**
 * @typedef {{ [shortDID: string]: CompactHandleOrHandleDisplayName }} IndexedBucket
 */

/** @type {{ [searchText: string]: SearchMatch[] }}*/
const cachedSearches = {};

/**
 * @param {string} searchText
 * @return {SearchMatch[] | Promise<SearchMatch[]>}
 */
export function searchHandle(searchText) {
  if (cachedSearches[searchText]) return cachedSearches[searchText];

  const wordStarts = getWordStartsLowerCase(searchText, 3);
  if (!wordStarts.length) return [];

  const bucketsOrPromises = wordStarts.map(wordStart => getBucket(wordStart));
  const allStaticallyResolved = !bucketsOrPromises.some(bucket => isPromise(bucket));

  if (allStaticallyResolved) {
    const searchMatches = performSearchOverBuckets(
      searchText,
      /** @type {IndexedBucket[]} */(bucketsOrPromises));

    cachedSearches[searchText] = searchMatches;
    return searchMatches;
  }

  return (async () => {
    const buckets = await Promise.all(bucketsOrPromises);
    const searchMatches = performSearchOverBuckets(searchText, buckets);
    cachedSearches[searchText] = searchMatches;
    return searchMatches;
  })();
}

var wordStartRegExp = /[A-Z]*[a-z]*/g;
/**
 * @param {string} str
 * @param {number=} count
 * @param {string[]=} wordStarts
 */
function getWordStartsLowerCase(str, count, wordStarts) {
  if (typeof count !== 'number' || !Number.isFinite(count)) count = 3;
  if (!wordStarts) wordStarts = [];
  str.replace(wordStartRegExp, function (match) {
    const wordStart = match && match.slice(0, count).toLowerCase();
    if (wordStart && wordStart.length === count && /** @type {string[]} */(wordStarts).indexOf(wordStart) < 0)
        /** @type {string[]} */(wordStarts).push(wordStart);
    return match;
  });
  return wordStarts;
}

/** @type {{ [threeLetterPrefix: string]: Promise<IndexedBucket> | IndexedBucket }} */
const buckets = {};

/**
 * @param {string} threeLetterPrefix
 * @returns {Promise<IndexedBucket> | IndexedBucket}
 */
function getBucket(threeLetterPrefix) {
  if (buckets[threeLetterPrefix]) return buckets[threeLetterPrefix];

  // TODO: failover/retry?
  return buckets[threeLetterPrefix] = (async () => {
    const bucketPath =
      'https://colds.ky/index/' +
      threeLetterPrefix[0] + '/' +
      threeLetterPrefix.slice(0, 2) + '/' +
      threeLetterPrefix.slice(1) + '.json';

    const bucket = await fetch(bucketPath).then(r => r.json());

    return bucket;
  })();
}
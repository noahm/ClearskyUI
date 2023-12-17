// @ts-check
/// <reference path="../types.d.ts" />

/**
 * @typedef {{ [shortDID: string]: CompactHandleOrHandleDisplayName }} IndexedBucket
 */

/** @type {{ [twoLetterPrefix: string]: Promise<IndexedBucket> | IndexedBucket }} */
const buckets = {};

/** @type {{ [searchText: string]: SearchMatch[] }}*/
const cachedSearches = {};

/**
 * @param {string} searchText
 * @return {SearchMatch[] | Promise<SearchMatch[]>}
 */
export function searchHandle(searchText) {
  if (cachedSearches[searchText]) return cachedSearches[searchText];

  

}
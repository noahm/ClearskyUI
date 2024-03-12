// @ts-check

import { unwrapShortHandle, v1APIPrefix, xAPIKey } from '.';
import { parseNumberWithCommas, unwrapClearSkyURL } from './core';
import { resolveHandleOrDID } from './resolve-handle-or-did';

/**
 * @param {string} handleOrDID
 */
export function blocklist(handleOrDID) {
  return blocklistCall(handleOrDID, 'blocklist');
}

/**
 * @param {string} handleOrDID
 */
export function singleBlocklist(handleOrDID) {
  return blocklistCall(handleOrDID, 'single-blocklist');
}

/**
 * @typedef {{
 *  shortDID: string,
 *  api: string,
 *  count: number,
 *  nextPage: number,
 *  blocklist: BlockedByRecord[]
 * }} BlockCacheEntry
 */

/**
 * @type {{ [key: string]: BlockCacheEntry }}
 */
const blockApiResultCache = {};

/**
 * @param {string} handleOrDID
 * @param {string} api
 * @returns {AsyncGenerator<{
 *    count: number,
 *    nextPage: number,
 *    blocklist: BlockedByRecord[]
 * }>}
 */
async function* blocklistCall(handleOrDID, api) {
  const resolved = await resolveHandleOrDID(handleOrDID);

  if (!resolved) throw new Error('Could not resolve handle or DID: ' + handleOrDID);

  const key = resolved.shortDID + '/' + api;
  let cacheEntry = blockApiResultCache[key];
  if (cacheEntry) {
    yield {
      count: cacheEntry.count,
      nextPage: cacheEntry.nextPage,
      blocklist: cacheEntry.blocklist
    };

    if (!cacheEntry.nextPage) return;
  }

  /**
   * @typedef {{
   *  data: {
   *    blocklist: BlockedByRecord[],
   *    count: string,
   *    pages: number
   *  },
   *  identity: string,
   *  status: boolean
   * }} SingleBlocklistResponse */

  const handleURL =
    unwrapClearSkyURL(v1APIPrefix + api + '/') +
    unwrapShortHandle(resolved.shortHandle);
  
  let nextPageNumber = cacheEntry?.nextPage || 0;
  while (true) {

    /** @type {SingleBlocklistResponse} */
    const pageResponse = await fetch(
      nextPageNumber === 0 ? handleURL : handleURL + '/' + nextPageNumber,
      { headers: { 'X-API-Key': xAPIKey } }).then(x => x.json());

    let pages = parseNumberWithCommas(pageResponse.data.pages) || 1;
    let count = parseNumberWithCommas(pageResponse.data.count) || 0;

    const chunk = pageResponse.data.blocklist;

    if (cacheEntry) {
      cacheEntry.blocklist = cacheEntry.blocklist.concat(chunk);
    } else {
      blockApiResultCache[key] = cacheEntry = {
        shortDID: resolved.shortDID,
        api,
        count,
        nextPage: 0,
        blocklist: chunk
      };
    }
    cacheEntry.count = count;
    cacheEntry.nextPage = nextPageNumber >= pages ? 0 : nextPageNumber + 1;

    yield {
      count,
      nextPage: pages > 1 ? 1 : 0,
      blocklist
    };

    if (pages <= 1) return;

    for (let i = 2; i <= pages; i++) {
      /** @type {SingleBlocklistResponse} */
      const nextPage = await fetch(
        handleURL + '/' + i,
        { headers: { 'X-API-Key': xAPIKey } }).then(x => x.json());

      pages = parseNumberWithCommas(nextPage.data.pages) || 1;
      count = parseNumberWithCommas(nextPage.data.count) || 0;
      blocklist = blocklist.concat(nextPage.data.blocklist);

      yield {
        count,
        nextPage: i >= pages ? 0 : i + 1,
        blocklist
      };
    }
  }
}

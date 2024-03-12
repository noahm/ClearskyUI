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

  /** @type {SingleBlocklistResponse} */
  const firstPage = await fetch(
    handleURL,
    { headers: { 'X-API-Key': xAPIKey } }).then(x => x.json());

  let pages = parseNumberWithCommas(firstPage.data.pages) || 1;
  let count = parseNumberWithCommas(firstPage.data.count) || 0;
  let blocklist = firstPage.data.blocklist; 
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

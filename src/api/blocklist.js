// @ts-check

import { unwrapShortHandle, xAPIKey } from '.';
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
 *    pages: number, count: number,
 *    blocklist: BlockedByRecord[]
 * }>}
 */
async function* blocklistCall(handleOrDID, api) {
  const resolved = await resolveHandleOrDID(handleOrDID);

  if (!resolved) throw new Error('Could not resolve handle or DID: ' + handleOrDID);

  /**
   * @typedef {{
   *  data: {
   *    block_list: { blocked_date: string, handle: string, status: boolean }[],
   *    count: string,
   *    pages: number
   *  },
   *  identity: string,
   *  status: boolean
   * }} SingleBlocklistResponse */

  const handleURL =
    unwrapClearSkyURL('/api/v1/' + api + '/') +
    unwrapShortHandle(resolved.shortHandle);

  /** @type {SingleBlocklistResponse} */
  const firstPage = await fetch(
    handleURL,
    { headers: { 'X-API-Key': xAPIKey } }).then(x => x.json());


  const pages = Number(firstPage.data.pages) || 1;
  const count = parseNumberWithCommas(firstPage.data.count) || 0;
  const firstPageEntry = /** @type {*} */({ ...firstPage, ...firstPage.data, pages, count });
  yield firstPageEntry;

  if (pages <= 1) return;

  for (let i = 2; i <= pages; i++) {
    const nextPage = await fetch(
      handleURL + '/' + i,
      { headers: { 'X-API-Key': xAPIKey } }).then(x => x.json());
    
    yield { ...nextPage, ...nextPage.data, pages, count };
  }
}

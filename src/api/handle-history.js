// @ts-check

import { unwrapShortDID, v1APIPrefix, xAPIKey } from '.';
import { unwrapClearSkyURL } from './core';
import { throttledAsyncCache } from './throttled-async-cache';

// /api/v1/get-handle-history/

/** 
 * @typedef {{
 *  identifier: string,
 *  handle_history: [handle: string, date: string, pds: string][]
 * }} HandleHistoryResponse
 */

/** @type {{ [shortDID: string]: HandleHistoryResponse | Promise<HandleHistoryResponse>}} */
const handleHistoryCache = {};

/** @param {string | null | undefined} handleOrDID */
export function getHandleHistory(handleOrDID) {
  if (!handleOrDID) return;
  let fromCache = handleHistoryCache[handleOrDID];
  if (fromCache) return fromCache;

  let resolved = false;
  return (handleHistoryCache[handleOrDID] = getHandleHistoryRaw(handleOrDID)
    .then(
      data => {
        const { identifier } = data;
        resolved = true;
        return handleHistoryCache[handleOrDID] =
          handleHistoryCache[identifier] =
          /** @type {HandleHistoryResponse} */(data);
      }
  ).finally(
    () => {
      if (!resolved)
        delete handleHistoryCache[handleOrDID];
    }));
}

/** @param {string} handleOrDID */
async function getHandleHistoryRaw(handleOrDID) {
  const json = await fetch(
    unwrapClearSkyURL(v1APIPrefix + 'get-handle-history/') + unwrapShortDID(handleOrDID),
    { headers: { 'X-API-Key': xAPIKey } }).then(x => x.json());
  return json.data;
}

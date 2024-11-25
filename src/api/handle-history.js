// @ts-check

import { useQuery } from '@tanstack/react-query';
import { unwrapShortDID, v1APIPrefix, xAPIKey } from '.';
import { unwrapClearSkyURL } from './core';

// /api/v1/get-handle-history/

/** 
 * @typedef {{
 *  identifier: string,
 *  handle_history: [handle: string, date: string, pds: string][]
 * }} HandleHistoryResponse
 */

/**
 * 
 * @param {string} shortDid 
 */
export function useHandleHistory(shortDid) {
  return useQuery({
    enabled: !!shortDid,
    queryKey: ['get-handle-history', shortDid],
    queryFn: () => getHandleHistoryRaw(shortDid, false),
  })
}

/**
 * @param {string} handleOrDID
 * @param {boolean} isHandle
 * @returns {Promise<HandleHistoryResponse>}
 */
async function getHandleHistoryRaw(handleOrDID, isHandle) {
  const unwrappedHandleOrDID = isHandle ? handleOrDID : unwrapShortDID(handleOrDID);
  const json = await fetch(
    unwrapClearSkyURL(v1APIPrefix + 'get-handle-history/') + unwrappedHandleOrDID,
    { headers: { 'X-API-Key': xAPIKey } }).then(x => x.json());
  return json.data;
}

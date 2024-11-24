// @ts-check

import { unwrapShortHandle, v1APIPrefix, xAPIKey } from '.';
import { parseNumberWithCommas, unwrapClearSkyURL } from './core';
import { resolveHandleOrDID } from './resolve-handle-or-did';
import { useInfiniteQuery } from '@tanstack/react-query';

/**
 * @param {string} handleOrDID
 */
export function useBlocklist(handleOrDID) {
  return useInfiniteQuery({
    queryKey: ['blocklist', handleOrDID],
    queryFn: ({ pageParam = 1 }) =>
      blocklistCall(handleOrDID, 'blocklist', pageParam),
    getNextPageParam: (lastPage, pages) => lastPage.nextPage,
  });
}

/**
 * @param {string} handleOrDID
 */
export function useSingleBlocklist(handleOrDID) {
  return useInfiniteQuery({
    queryKey: ['single-blocklist', handleOrDID],
    queryFn: ({ pageParam = 1 }) =>
      blocklistCall(handleOrDID, 'single-blocklist', pageParam),
    getNextPageParam: (lastPage, pages) => lastPage.nextPage,
  });
}

/**
 * @param {string} handleOrDID
 * @param {"blocklist" | "single-blocklist"} api
 * @param {number} currentPage
 * @returns {Promise<{
 *    count: number,
 *    nextPage: number | null,
 *    blocklist: BlockedByRecord[]
 * }>}
 */
export async function blocklistCall(handleOrDID, api, currentPage = 1) {
  const resolved = await resolveHandleOrDID(handleOrDID);

  if (!resolved)
    throw new Error('Could not resolve handle or DID: ' + handleOrDID);

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
  const pageResponse = await fetch(
    currentPage === 1 ? handleURL : handleURL + '/' + currentPage,
    { headers: { 'X-API-Key': xAPIKey } }
  ).then((x) => x.json());

  let pages = parseNumberWithCommas(pageResponse.data.pages) || 1;
  let count = parseNumberWithCommas(pageResponse.data.count) || 0;

  const chunk = pageResponse.data.blocklist;

  return {
    count,
    nextPage: pages === currentPage ? null : currentPage + 1,
    blocklist: chunk,
  };
}

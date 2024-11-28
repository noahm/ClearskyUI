// @ts-check

import { unwrapShortHandle, v1APIPrefix, xAPIKey } from '.';
import { unwrapClearSkyURL } from './core';
import { resolveHandleOrDID } from './resolve-handle-or-did';
import { useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 100;

/**
 * @param {string} handleOrDID 
 */
export function useList(handleOrDID) {
  return useInfiniteQuery({
    enabled: !!handleOrDID,
    queryKey: ['lists', handleOrDID],
    queryFn: ({ pageParam }) => getList(handleOrDID, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

/** 
 * @param {string} handleOrDID 
 * @param {number} currentPage
 * @returns {Promise<{
 *    lists: AccountListEntry[],
 *    nextPage: number | null
 * }>}
 */
async function getList(handleOrDID, currentPage = 1) {
  const resolved = await resolveHandleOrDID(handleOrDID);
  if (!resolved) throw new Error('Could not resolve handle or DID: ' + handleOrDID);

  const handleURL =
    unwrapClearSkyURL(v1APIPrefix + 'get-list/') +
    unwrapShortHandle(resolved.shortHandle) +
    (currentPage === 1 ? '' : '/' + currentPage);

  /** @type {{ data: { lists: AccountListEntry[] } }} */
  const re = await fetch(
    handleURL,
    { headers: { 'X-API-Key': xAPIKey } }).then(x => x.json());

  const lists = re.data?.lists || [];
  
  // Sort by date
  lists.sort((entry1, entry2) => {
    const date1 = new Date(entry1.date_added).getTime();
    const date2 = new Date(entry2.date_added).getTime();
    return date2 - date1;
  });

  return {
    lists,
    nextPage: lists.length >= PAGE_SIZE ? currentPage + 1 : null
  };
}
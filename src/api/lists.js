// @ts-check

import { unwrapShortHandle, v1APIPrefix } from '.';
import { unwrapClearSkyURL } from './core';
import { resolveHandleOrDID } from './resolve-handle-or-did';
import { throttledAsyncCache } from './throttled-async-cache';

/** @type {typeof getList} */
export const getListCached = throttledAsyncCache(getList);

/** @param {string} handleOrDID */
export async function getList(handleOrDID) {
  const resolved = await resolveHandleOrDID(handleOrDID);
  if (!resolved) throw new Error('Could not resolve handle or DID: ' + handleOrDID);

  const handleURL =
    unwrapClearSkyURL(v1APIPrefix + 'get-list/') +
    unwrapShortHandle(resolved.shortHandle);

  /** @type {{ data: { lists: AccountListEntry[] } }} */
  const re = await fetch(
    handleURL,
    { headers: { 'X-API-Key': xAPIKey } }).then(x => x.json());

  const lists = re.data?.lists;
  if (lists) {
    lists.sort((entry1, entry2) => {
      const date1 = new Date(entry1.date_added).getTime();
      const date2 = new Date(entry2.date_added).getTime();
      return date2 - date1;
    });
  }
  return lists;
}
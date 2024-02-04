// @ts-check

import { unwrapShortHandle, xAPIKey } from '.';
import { unwrapClearSkyURL } from './core';
import { resolveHandleOrDID } from './resolve-handle-or-did';

export async function getList(handleOrDID) {
  const resolved = await resolveHandleOrDID(handleOrDID);
  if (!resolved) throw new Error('Could not resolve handle or DID: ' + handleOrDID);

  const handleURL =
    unwrapClearSkyURL('/api/v1/get-list/') +
    unwrapShortHandle(resolved.shortHandle);

  /** @type {{ data: { lists: AccountListEntry } }} */
  const re = await fetch(
    handleURL,
    { headers: { 'X-API-Key': xAPIKey } }).then(x => x.json());

  return re.data?.lists;
}
// @ts-check

import { isPromise, resolveHandleOrDID, unwrapShortHandle } from '../api';
import { forAwait } from '../common-components/for-await';

/**
 * @typedef {Partial<AccountInfo> & { loading?: undefined, error?: undefined } | 
 *  { shortHandle: string, loading: true, error?: undefined } |
 *  { shortHandle: string, error: Error, loading?: undefined }
 * } AccountInfoResolving
 */

/**
 * @param {string | Partial<AccountInfo> & { loading?: boolean, error?: Error } | null | undefined} account 
 * @returns {AccountInfoResolving | undefined}
 */
export function useResolveAccount(account) {
  const resolved = forAwait(account, resolveOrCatch);
  if (!resolved) {
    const shortHandle = getShortHandle(account);
    if (!shortHandle) return undefined;
    return { shortHandle, loading: true };
  }
  return resolved;
}

/**
 * @param {Parameters<typeof useResolveAccount>[0]} account 
 */
function getShortHandle(account) {
  const shortHandle =
    !account ? undefined :
      typeof account === 'string' ? account :
        account.shortDID || account.shortHandle;
  return shortHandle;
}

/**
 * @param {Parameters<typeof useResolveAccount>[0]} account
 * @returns {AccountInfoResolving | Promise<AccountInfoResolving> | undefined}
 */
function resolveOrCatch(account) {
  if (!account) return undefined;
  if (typeof account !== 'string' && (account.error || !account.loading)) return /** @type {AccountInfoResolving} */(account);
  const handle = typeof account === 'string' ? account : account.shortDID || account.shortHandle;
  if (!handle) return undefined;
  const resolved = resolveHandleOrDID(handle);
  if (!isPromise(resolved)) return resolved;

  return resolved.catch(error => ({ shortHandle: unwrapShortHandle(handle), error }));
}

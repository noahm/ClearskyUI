import { unwrapShortHandle, xAPIKey } from '.';
import { resolveHandleOrDID } from './resolve-handle-or-did';

/**
 * 
 * @param {string} handleOrDID
 * @returns {AsyncGenerator<{
 *    pages: number, count: number,
 *    block_list: { blocked_date: string, handle: string, status: boolean }[]
 * }>}
 */
export async function* singleBlocklist(handleOrDID) {
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

  /** @type {SingleBlocklistResponse} */
  const firstPage = await fetch(
    '/api/v1/single-blocklist/' + unwrapShortHandle(resolved.handle),
    { headers: { 'X-API-Key': xAPIKey } }).then(x => x.json());


  const pages = Number(firstPage.data.pages) || 1;
  const count = Number(firstPage.data.count) || 0;
  if (pages <= 1) return;

  yield* { ...firstPage, ...firstPage.data, pages, count };

  for (let i = 2; i < pages; i++) {
    const nextPage = await fetch(
      '/api/v1/single-blocklist/' + unwrapShortHandle(resolved.handle) + '/' + i,
      { headers: { 'X-API-Key': xAPIKey } }).then(x => x.json());
    
    yield* { ...nextPage, ...nextPage.data, pages, count };
  }
}
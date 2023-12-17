import { unwrapShortHandle, xAPIKey } from '.';
import { resolveHandleOrDID } from './resolve-handle-or-did';

/**
 * 
 * @param {string} handleOrDID
 * @returns {AsyncGenerator<{
 *    pages: number, count: number,
 *    blocklist: BlockedByRecord[]
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

  let handleURL =
    unwrapClearSkyURL('/api/v1/single-blocklist/') +
    unwrapShortHandle(resolved.shortHandle);

  /** @type {SingleBlocklistResponse} */
  const firstPage = await fetch(
    handleURL,
    { headers: { 'X-API-Key': xAPIKey } }).then(x => x.json());


  const pages = Number(firstPage.data.pages) || 1;
  const count = Number(firstPage.data.count) || 0;
  if (pages <= 1) return;
  pages.toString();

  yield { ...firstPage, ...firstPage.data, pages, count };

  for (let i = 2; i < pages; i++) {
    const nextPage = await fetch(
      handleURL + '/' + i,
      { headers: { 'X-API-Key': xAPIKey } }).then(x => x.json());
    
    yield { ...nextPage, ...nextPage.data, pages, count };
  }
}

let baseURL = 'https://staging.bsky.thieflord.dev/';

function unwrapClearSkyURL(apiURL) {
  return baseURL + apiURL.replace(/^\//, '');
}
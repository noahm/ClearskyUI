// @ts-check
/// <reference path="../types.d.ts" />

export { postHistory } from './post-history';
export { resolveHandleOrDID } from './resolve-handle-or-did';
export { searchHandle } from './search';
export { singleBlocklist } from './single-blocklist';

export const xAPIKey = 'CLEARSKYtest90asdfghjklqwerr2345';

export function getProfileBlobUrl(did, cid) {
  if (!did || !cid) return undefined;
  return `https://cdn.bsky.app/img/avatar/plain/${unwrapShortDID(did)}/${cid}@jpeg`;
}

export function getFeedBlobUrl(did, cid) {
  if (!did || !cid) return undefined;
  return `https://cdn.bsky.app/img/feed_thumbnail/plain/${unwrapShortDID(did)}/${cid}@jpeg`;
}

/** @param {string} text */
export function likelyDID(text) {
  return text && (
    !text.trim().indexOf('did:') ||
    text.trim().length === 24 && !/[^\sa-z0-9]/i.test(text)
  );
}

/** @param {string | null | undefined} did */
export function shortenDID(did) {
  return typeof did === 'string' ? did.replace(/^did\:plc\:/, '') : did;
}

export function unwrapShortDID(shortDID) {
  return !shortDID ? shortDID : shortDID.indexOf(':') < 0 ? 'did:plc:' + shortDID : shortDID;
}

export function unwrapShortHandle(shortHandle) {
  return !shortHandle ? shortHandle : shortHandle.indexOf('.') < 0 ? shortHandle + '.bsky.social' : shortHandle;
}

/**
 * @param {T} handle
 * @returns {T}
 * @template {string | undefined | null} T
 */
export function shortenHandle(handle) {
  return handle && /** @type {T} */(handle.replace(_shortenHandle_Regex, ''));
}
const _shortenHandle_Regex = /\.bsky\.social$/;

/**
* @param {string=} uri
*/
export function breakFeedUri(uri) {
  if (!uri) return;
  const match = _breakFeedUri_Regex.exec(uri);
  if (!match || !match[3]) return;
  return { shortDID: match[2], postID: match[3] };
}
const _breakFeedUri_Regex = /^at\:\/\/(did:plc:)?([a-z0-9]+)\/[a-z\.]+\/?(.*)?$/;

/**
 * @param {any} x
 * @returns {x is Promise<any>}
 */
export function isPromise(x) {
  if (!x || typeof x !== 'object') return false;
  else return typeof x.then === 'function';
}

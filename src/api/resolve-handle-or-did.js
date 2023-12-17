// @ts-check
/// <reference path="../types.d.ts" />

import { getProfileBlobUrl, isPromise, likelyDID, shortenHandle, unwrapShortDID, unwrapShortHandle } from '.';
import { atClient } from './core';
import { throttledAsyncCache } from './throttled-async-cache';

const resolveHandleCache = throttledAsyncCache(async (handle) => {
  const resolved = await atClient.com.atproto.identity.resolveHandle({ handle: unwrapShortHandle(handle) });
  if (!resolved.data.did) throw new Error('Handle did not resolve: ' + handle);
  return resolved.data.did;
});

const resolveDIDCache = throttledAsyncCache(async (did) => {
  const describePromise = atClient.com.atproto.repo.describeRepo({
    repo: unwrapShortDID(did)
  });

  const profilePromise = atClient.com.atproto.repo.listRecords({
    collection: 'app.bsky.actor.profile',
    repo: unwrapShortDID(did)
  });

  const [describe, profile] = await Promise.all([describePromise, profilePromise]);

  if (!describe.data.handle) throw new Error('DID does not have a handle: ' + did);

  const shortHandle = shortenHandle(describe.data.handle);

  /** @type {*} */
  const profileRec = profile.data.records?.filter(rec => rec.value)[0]?.value;
  const avatarUrl = getProfileBlobUrl(did, profileRec?.avatar?.ref?.toString());
  const bannerUrl = getProfileBlobUrl(did, profileRec?.banner?.ref?.toString());
  const displayName = profileRec?.displayName;
  const description = profileRec?.description;

  const profileDetails = {
    did: unwrapShortDID(did),
    shortHandle,
    avatarUrl,
    bannerUrl,
    displayName,
    description
  };

  return profileDetails;
});

/**
 * @param {string} handleOrDid
 * @returns {AccountInfo | Promise<AccountInfo>}
 */
export function resolveHandleOrDID(handleOrDid) {
  if (likelyDID(handleOrDid)) return resolveDIDCache(unwrapShortDID(handleOrDid));
  const didOrPromise = resolveHandleCache(unwrapShortHandle(handleOrDid));

  if (isPromise(didOrPromise)) return didOrPromise.then(resolveDIDCache);
  else return resolveDIDCache(didOrPromise);
}

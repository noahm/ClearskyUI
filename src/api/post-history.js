// @ts-check
/// <reference path="../types.d.ts" />

import { breakFeedUri, isPromise, unwrapShortDID } from '.';
import { atClient } from './core';
import { resolveHandleOrDID } from './resolve-handle-or-did';
import { throttledAsyncCache } from './throttled-async-cache';

/** @type {{ [did: string]: { did: string, handle: string, posts: PostDetails[], hasMore?: boolean, fetchMore: () => Promise<void> | undefined } }} */
const historyCache = {};

/** @type {{ [uri: string]: PostDetails | Promise<PostDetails> }} */
const historyPostByUri = {};

export function postHistory(handleOrDid) {
  const accountInfoOrPromise = resolveHandleOrDID(handleOrDid);
  if (!isPromise(accountInfoOrPromise) && historyCache[accountInfoOrPromise.shortDID]) return historyCache[accountInfoOrPromise.shortDID];

  return (async () => {
    const accountInfo = await accountInfoOrPromise;
    if (!isPromise(accountInfo) && historyCache[accountInfo.shortDID]) return historyCache[accountInfo.shortDID];

    let fetchingMore;
    let cursor;
    let reachedEndRepeatAt;

    /** @type {typeof historyCache['a']} */
    const fetcher = historyCache[accountInfo.shortDID] = {
      did: accountInfo.shortDID,
      handle: accountInfo.shortHandle,
      posts: [],
      hasMore: true,
      fetchMore
    };
    fetchMore();
    return fetcher;

    function fetchMore() {
      if (fetchingMore) return fetchingMore;
      if (reachedEndRepeatAt && Date.now() < reachedEndRepeatAt) return;

      return fetchingMore = (async () => {

        const history = await atClient.com.atproto.repo.listRecords({
          collection: 'app.bsky.feed.post',
          repo: accountInfo.shortDID,
          cursor,
        });

        if (history?.data?.cursor) {
          cursor = history.data.cursor;
        } else {
          reachedEndRepeatAt = Date.now() + 1000 * 20;
          fetcher.hasMore = false;
        }

        if (history?.data?.records?.length) {
          for (const record of history.data.records) {
            const post = {
              uri: record.uri,
              cid: record.cid,
              .../** @type {import('@atproto/api').AppBskyFeedPost.Record} */(record.value)
            };
            fetcher.posts.push(post);
            historyPostByUri[post.uri] = post;
          }
        }

        fetchingMore = undefined;
      })();
    }
  })();
}

const throttledPostGet = throttledAsyncCache(async (uri) => {
  const uriEntity = breakFeedUri(uri);
  if (!uriEntity) throw new Error('Invalid post URI: ' + uri);

  const postRecord = await atClient.com.atproto.repo.getRecord({
    repo: unwrapShortDID(uriEntity.shortDID),
    collection: 'app.bsky.feed.post',
    rkey: uriEntity.postID
  });

  return {
    uri: postRecord.data.uri,
    cid: postRecord.data.cid,
    .../** @type {*} */(postRecord.data.value)
  };
});

/**
 * @param {string} uri
 * @returns {PostDetails | Promise<PostDetails>}
 */
export function getPost(uri) {
  if (historyPostByUri[uri]) return historyPostByUri[uri];

  return throttledPostGet(uri);
}

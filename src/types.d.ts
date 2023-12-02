/// <reference types="@atproto/api" />

type AccountInfo = {
  did: string;
  handle: string;
  displayName?: string;
  avatarUrl?: string;
  bannerUrl?: string;
}

type PostDetails = import('@atproto/api').AppBskyFeedPost.Record & {
  uri: string;
  cid: string;
}
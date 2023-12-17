/// <reference types="@atproto/api" />

type AccountInfo = {
  shortDID: string;
  shortHandle: string;
  displayName?: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
}

type PostDetails = import('@atproto/api').AppBskyFeedPost.Record & {
  uri: string;
  cid: string;
}

type BlockedByRecord = {
  blocked_date: string;
  handle: string;
  status: boolean;
}

type CompactHandleOrHandleDisplayName =
  string |
  [shortHandle: string, displayName: string];

type SearchMatch = {
  rank: number;

  shortDID: string;
  shortDIDMatches?: string;

  shortHandle: string;
  handleMatches?: string;

  displayName?: string;
  displayNameMatches?: string;
}

type DashboardStats = {
  asof: string;
  /** 2,186,543 */
  active_count?: string;
  /** 19,205 */
  deleted_count?: string;
  /** 2,205,748 */
  total_count?: string;
}
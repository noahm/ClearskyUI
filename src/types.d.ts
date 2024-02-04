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
  shortHandleMatches?: string;

  displayName?: string;
  displayNameMatches?: string;

  postID?: string;
}

type DashboardStats = { asof: string; } & Partial<{
  /** 2,186,543 */
  active_count: string | number;
  /** 19,205 */
  deleted_count: string | number;
  /** 2,205,748 */
  total_count: string;

  /** 6 */
  averageNumberOfBlocked: number,
  /** 11.66 */
  averageNumberOfBlocks: number,
  
  /** 373, 645 */
  numberBlocked1: string | number,

  /** 3,412 */
  numberBlocked101and1000: string | number,
  /** 211,780 */
  numberBlocked2and100: string | number,
  /** 408 */
  numberBlockedGreaterThan1000: string | number,
  
  /** 121,336 */
  numberBlock1: string | number,
  /** 5,645 */
  numberBlocking101and1000: string | number,
  /** 175,939 */
  numberBlocking2and100: string | number,
  /** 40 */
  numberBlockingGreaterThan1000: string | number,

  /** 3,542,562 */
  numberOfTotalBlocks: string | number,
  /** 589,245 */
  numberOfUniqueUsersBlocked: string | number,
  /** 302,960 */
  numberOfUniqueUsersBlocking: string | number,

  /** 63.41 */
  percentNumberBlocked1: string | number,
  /** 0.58 */
  percentNumberBlocked101and1000: string | number,
  /** 35.94 */
  percentNumberBlocked2and100: string | number,
  /** 0.07 */
  percentNumberBlockedGreaterThan1000: string | number,
  /** 40.05 */
  percentNumberBlocking1: string | number,
  /** 1.86 */
  percentNumberBlocking101and1000: string | number,
  /** 1.86 */
  percentNumberBlocking2and100: string | number,
  /** 0.01 */
  percentNumberBlockingGreaterThan1000: string | number,
  /** 26.71 */
  percentUsersBlocked: string | number,
  /** 13.74 */
  percentUsersBlocking: string | number,
  /** 2,205,748 */
  totalUsers: string | number,

  blocked: DashboardBlockListEntry[],
  blocked24: DashboardBlockListEntry[],
  blockers: DashboardBlockListEntry[],
  blockers24: DashboardBlockListEntry[]
}>;

type DashboardBlockListEntry = {
  /** mailia.bsky.social */
  Handle: string,
  /** https://bsky.app/profile/did:plc:i3bauhmsixt5j33pnr5g7475 */
  ProfileURL: string,
  /** 1589 */
  block_count: string | number,
  /** did:plc:i3bauhmsixt5j33pnr5g7475 */
  did: string
};

type AccountListEntry = {
  created_date: string,
  date_added: string,
  description: string,
  handle: string,
  name: string,
  status: boolean,
  url: string
}

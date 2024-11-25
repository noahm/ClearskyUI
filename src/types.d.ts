/// <reference types="@atproto/api" />

type AccountInfo = {
  shortDID: string;
  shortHandle: string;
  displayName?: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  obscurePublicRecords?: boolean;
}

type PostDetails = import('@atproto/api').AppBskyFeedPost.Record & {
  uri: string;
  cid: string;
}

type BlockedByRecord = {
  blocked_date: string;
  did: string;
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

type ValueWithDisplayName = {
  displayname?: string;
  value: string | number | undefined;
}

type DashboardStats = { asof: string; } & Partial<{
  /** 2,186,543 */
  active_count: ValueWithDisplayName;
  /** 19,205 */
  deleted_count: ValueWithDisplayName;
  /** 2,205,748 */
  total_count: ValueWithDisplayName;

  /** 6 */
  averageNumberOfBlocked: ValueWithDisplayName,
  /** 11.66 */
  averageNumberOfBlocks: ValueWithDisplayName,
  
  /** 373, 645 */
  numberBlocked1: ValueWithDisplayName,

  /** 3,412 */
  numberBlocked101and1000: ValueWithDisplayName,
  /** 211,780 */
  numberBlocked2and100: ValueWithDisplayName,
  /** 408 */
  numberBlockedGreaterThan1000: ValueWithDisplayName,
  
  /** 121,336 */
  numberBlock1: ValueWithDisplayName,
  /** 5,645 */
  numberBlocking101and1000: ValueWithDisplayName,
  /** 175,939 */
  numberBlocking2and100: ValueWithDisplayName,
  /** 40 */
  numberBlockingGreaterThan1000: ValueWithDisplayName,

  /** 3,542,562 */
  numberOfTotalBlocks: ValueWithDisplayName,
  /** 589,245 */
  numberOfUniqueUsersBlocked: ValueWithDisplayName,
  /** 302,960 */
  numberOfUniqueUsersBlocking: ValueWithDisplayName,

  /** 63.41 */
  percentNumberBlocked1: ValueWithDisplayName,
  /** 0.58 */
  percentNumberBlocked101and1000: ValueWithDisplayName,
  /** 35.94 */
  percentNumberBlocked2and100: ValueWithDisplayName,
  /** 0.07 */
  percentNumberBlockedGreaterThan1000: ValueWithDisplayName,
  /** 40.05 */
  percentNumberBlocking1: ValueWithDisplayName,
  /** 1.86 */
  percentNumberBlocking101and1000: ValueWithDisplayName,
  /** 1.86 */
  percentNumberBlocking2and100: ValueWithDisplayName,
  /** 0.01 */
  percentNumberBlockingGreaterThan1000: ValueWithDisplayName,
  /** 26.71 */
  percentUsersBlocked: ValueWithDisplayName,
  /** 13.74 */
  percentUsersBlocking: ValueWithDisplayName,
  /** 2,205,748 */
  totalUsers: ValueWithDisplayName,

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
  did: string,
  name: string,
  status: boolean,
  url: string
}

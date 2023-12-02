// @ts-check
/// <reference path="../types.d.ts" />

import { BskyAgent } from '@atproto/api';

const oldXrpc = 'https://bsky.social/xrpc';
// const newXrpc = 'https://bsky.network/xrpc';

export const atClient = new BskyAgent({ service: oldXrpc });
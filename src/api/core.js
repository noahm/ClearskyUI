// @ts-check
/// <reference path="../types.d.ts" />

import { BskyAgent } from '@atproto/api';

const oldXrpc = 'https://bsky.social/xrpc';
// const newXrpc = 'https://bsky.network/xrpc';

export const atClient = new BskyAgent({ service: oldXrpc });
patchBskyAgent(atClient);

/** @param {import('@atproto/api').BskyAgent} atClient */
function patchBskyAgent(atClient) {
  atClient.com.atproto.sync._service.xrpc.baseClient.lex.assertValidXrpcOutput = function (lexUri, value, ...rest) {
    return true;
  };
}

let baseURL = 'https://staging.bsky.thieflord.dev/';

export function unwrapClearSkyURL(apiURL) {
  return baseURL + apiURL.replace(/^\//, '');
}
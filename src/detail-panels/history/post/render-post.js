// @ts-check
/// <reference path="../../../types.d.ts" />

import React from 'react';

import { breakFeedUri, resolveHandleOrDID, unwrapShortDID } from '../../../api';
import { getPost } from '../../../api/post-history';

import { Tooltip } from '@mui/material';
import { AsyncLoad } from '../../../common-components/async-load';
import { FormatTimestamp } from '../../../common-components/format-timestamp';
import { PostContentText } from './post-content-text';
import { PostEmbed } from './post-embed';

import './render-post.css';

/**
 * @param {{
 *  post: PostDetails,
 *  className?: string,
 *  disableEmbedQT?: boolean | ((level: number, post: PostDetails) => boolean),
 *  level?: number,
 *  textHighlights?: string,
 *  textLightHighlights?: string
 * }} _
 */
export function RenderPost({ post, className, disableEmbedQT, level, textHighlights, textLightHighlights, ...rest }) {
  const postUri = breakFeedUri(/** @type {string} */(post.uri));

  const accountOrPromise = postUri && resolveHandleOrDID(postUri?.shortDID);

  return (
    <div {...rest} className={'post-with-content ' + (className || '')} onClick={() => {console.log('clicked post', post)}}>
      <h4 className='post-header'>
        <AsyncLoad
          loadAsync={accountOrPromise}
          dependencies={[postUri?.shortDID]}
          renderAsync={(account, shortDID) => {
            if (!account) return <UnknownAccountHeader post={post} />;

            return (
              <>
                <span className='post-account-avatar' style={
                  !account.avatarUrl ? undefined :
                    { backgroundImage: `url(${account.avatarUrl})` }
                }>@</span>
                <span className='post-account-display-name'>{account.displayName}</span>
                <span className='post-account-handle'> @{account.handle}</span>
                <Tooltip
                  title={
                    <pre style={{ marginBottom: '1em', color: 'black', background: 'whitesmoke', fontSize: '70%' }}>
                      {JSON.stringify(post, null, 2)}
                    </pre>
                  }>
                  <span className='post-account-display-delimiter'> &sdot; </span>
                </Tooltip>
                <FormatTimestamp
                  className='post-timestamp'
                  timestamp={post.createdAt}
                  Component='a'
                  href={createPostHref(account, postUri)}
                  target='_blank'
                />
                {
                  !post.reply ? undefined :
                    <>
                      <ReplyToLink post={post} className='post-replying-to-marker' />
                    </>
                }
              </>
            );
          }}>
          <LoadingAccountHeader post={post} did={postUri?.shortDID} />
        </AsyncLoad>
      </h4>
      <PostContentText
        className='post-content'
        highlightClassNameBase='post-content-highlight'
        facets={post.facets}
        textHighlights={textHighlights}
        textLightHighlights={textLightHighlights}
        text={post.text} />
      {
        <PostEmbed post={post} embed={post.embed} disableEmbedQT={disableEmbedQT} level={(level || 0)+1} />
      }
    </div>
  );
  
}


function UnknownAccountHeader({ post }) {
  const postUri = breakFeedUri(/** @type {string} */(post.uri));
  return 'Unknown account ' + (postUri?.shortDID || post.uri);
}

/**
 * @param {{
 *  post: PostDetails,
 *  did: string | undefined
 * }} _
 */
function LoadingAccountHeader({ post, did }) {
  return (
    <>
      <span>@</span>
      <span className='post-account-display-name'>Loading...</span>
    </>
  );
}

/**
 * @param {{
 *  post: PostDetails,
 *  className?: string
 * }} _
 */
function ReplyToLink({ post, ...rest }) {
  const parentUri = breakFeedUri(post.reply?.parent?.uri);
  const rootUri = breakFeedUri(post.reply?.root?.uri);

  const parentAccountOrPromise = resolveHandleOrDID(parentUri?.shortDID);
  const rootAccountOrPromise = resolveHandleOrDID(rootUri?.shortDID);

  return (
    <span {...rest}>
      <span className='post-replying-to-marker-text'>&lsaquo; </span>
      <AsyncLoad
        loadAsync={parentAccountOrPromise}
        dependencies={[parentUri?.shortDID]}
        renderAsync={(replyAccount, replyShortDID) => (
          <AsyncLoad
            loadAsync={rootAccountOrPromise}
            dependencies={[rootUri?.shortDID]}
            renderAsync={(rootAccount, rootShortDID) =>
              <>
                {
                  !replyAccount ?
                    <span className='post-replying-to-unresolved'>{unwrapShortDID(replyShortDID)}</span> :
                    <Tooltip title={!post.reply?.parent?.uri  ? null : <RenderPostInTooltip postUri={post.reply?.parent?.uri} />}>
                      <a href={createPostHref(replyAccount, parentUri)} target='_blank'>
                        <MiniAvatar className='post-replying-to-resolved' account={replyAccount} />
                      </a>
                    </Tooltip>
                }
                {
                  replyAccount && rootAccount && (replyAccount?.did !== rootAccount?.did) &&
                  <span className='post-account-display-delimiter'> &lsaquo; </span> ||
                  ''
                }
                {
                  rootAccount?.did === replyAccount?.did ? undefined :
                    !rootAccount ?
                      <span className='post-replying-to-unresolved post-replying-to-root'>{unwrapShortDID(rootShortDID)}</span> :
                      <Tooltip title={!post.reply?.root?.uri ? null : <RenderPostInTooltip postUri={post.reply?.root?.uri} />}>
                        <a href={createPostHref(rootAccount, rootUri)} target='_blank'>
                          <MiniAvatar className='post-replying-to-resolved post-replying-to-root' account={rootAccount} />
                        </a>
                      </Tooltip>
                }
              </>
            }>
            {
              !replyAccount ?
                <span className='post-replying-to-unresolved'>{unwrapShortDID(replyShortDID)}</span> :
                <Tooltip title={!post.reply?.parent?.uri ? null : <RenderPostInTooltip postUri={post.reply?.parent?.uri} />}>
                  <a href={createPostHref(replyAccount, parentUri)} target='_blank'>
                    <MiniAvatar className='post-replying-to-resolved' account={replyAccount} />
                  </a>
                </Tooltip>
            }
          </AsyncLoad>
        )}>
        <span className='post-replying-to-loading'>...</span>
      </AsyncLoad>
    </span>
  );
}

/**
 * @param {{
 *  postUri: string
 * }} _
 */
function RenderPostInTooltip({ postUri }) {
  return (
    <AsyncLoad
      loadAsync={() => getPost(postUri)}
      dependencies={[postUri]}
      renderAsync={(post, _postUri) => {
        return (
          <RenderPost post={post} disableEmbedQT className='post-content-embed-qt' />
        );
      }}
      renderError={error => <div>Error loading post: {error.message}</div>}
    >
      Loading {postUri}...
    </AsyncLoad>
  );
}


function MiniAvatar({ account, className, ...rest }) {
  return (
    <span className={'post-replying-mini-avatar ' + (className || '')} style={
      !account.avatarUrl ? undefined :
        { backgroundImage: `url(${account.avatarUrl})` }
    } {...rest}>{account.displayName}</span>
  );
}

function createPostHref(account, postUri) {
  return `https://bsky.app/profile/${account?.handle || unwrapShortDID(postUri.shortDID)}/post/${postUri.postID}`;
}

// @ts-check
/// <reference path="../../types.d.ts" />

import React from 'react';

import { resolveHandleOrDID } from '../../api';
import { AsyncLoad } from '../../common-components/async-load';
import { FormatTimestamp } from '../../common-components/format-timestamp';
import { Visible } from '../../common-components/visible';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { withStyles } from '@mui/styles';
import { MiniAccountInfo } from '../../common-components/mini-account-info';

const INITIAL_SIZE = 20;
const GROW_BLOCK_SIZE = 29;

/**
 * @param {{
 *  account: AccountInfo | { shortHandle: string, loading: true };
 *  blocklist: BlockedByRecord[];
 * }} _ 
 */
export function ListView({ account, blocklist }) {
  const [listSize, setListSize] = useState(INITIAL_SIZE);
  const showSize = Math.min(blocklist.length, listSize);
  return (
    <ul className='block-list'>
      {
        blocklist.slice(0, showSize).map((block, index) => {
          const entry =
            <ListViewEntry
              key={index}
              account={account}
              {...block} />;

          return (
            index < showSize - 1 ?
              entry :
              <Visible
                key={index}
                rootMargin='0px 0px 300px 0px'
                onVisible={handleBottomVisible}
              >
                {entry}
              </Visible>
          );
        })
      }
    </ul>
  );

  function handleBottomVisible() {
    const incrementListSize = listSize + GROW_BLOCK_SIZE;
    setListSize(incrementListSize);
    if (incrementListSize > blocklist.length) {
      // TODO: fetch more
    }
  }
}

const FlushBackgroundTooltip = withStyles({
  tooltip: {
    padding: '0',
    overflow: 'hidden'
  }
})(Tooltip);

/**
 * @param {{
 *  account: AccountInfo | {shortHandle: string, loading: true};
 *  blocked_date: string;
 *  handle: string;
 *  className?: string;
 * }} _
 */
function ListViewEntry({ account, blocked_date, handle, className, ...rest }) {
  const accountOrPromise = handle && resolveHandleOrDID(handle);

  const result = (
    <li {...rest} className={'blocking-list-entry ' + (className || '')}>
      <Link to={`/${handle}/history`} className='blocking-account-link'>
        <AsyncLoad
          loadAsync={accountOrPromise}
          renderAsync={blockingAccount => (
            <FlushBackgroundTooltip
              title={
                <AccountInfoPanel
                  account={blockingAccount}
                  blocked_date={blocked_date} />}>
              <div>
                <span className='blocking-account-avatar' style={
                  !blockingAccount.avatarUrl ? undefined :
                    { backgroundImage: `url(${blockingAccount.avatarUrl})` }
                }>@</span>

                <span className='blocking-account-handle'>{handle}</span>
                {' '}
                <FormatTimestamp
                  timestamp={blocked_date}
                  noTooltip
                  className='blocking-date' />
              </div>
            </FlushBackgroundTooltip>
          )}>
          @<span className='blocking-account-handle'>{handle}</span>
          {' '}
          <FormatTimestamp
            timestamp={blocked_date}
            noTooltip
            className='blocking-date' />

        </AsyncLoad>
      </Link>
    </li>
  );

  return result;
}

/**
 * @param {{
 *  account: AccountInfo,
 *  blocked_date: string | number | null | undefined
 * }} _
 */
function AccountInfoPanel({ account, blocked_date }) {
  return (
    <div className='blocking-account-info-panel'
      onClick={e => e.preventDefault()}>
      <MiniAccountInfo
        account={account}
        banner={
          !blocked_date ? undefined :
            <div className='account-info-panel-blocked-timestamp'>
              blocked
              <div className='account-info-panel-blocked-timestamp-full'>
                {new Date(blocked_date).toString()}
              </div>
            </div>
        } />
    </div>
  );
}

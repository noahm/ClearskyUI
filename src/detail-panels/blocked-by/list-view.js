// @ts-check
/// <reference path="../../types.d.ts" />

import React from 'react';

import { isPromise, resolveHandleOrDID } from '../../api';
import { AsyncLoad } from '../../common-components/async-load';
import { FormatTimestamp } from '../../common-components/format-timestamp';
import { Visible } from '../../common-components/visible';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';

const INITIAL_SIZE = 20;
const GROW_BLOCK_SIZE = 29;

/**
 * @param {{
 *  account: AccountInfo;
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

/**
 * @param {{
 *  account: AccountInfo;
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
              <Tooltip title={<AccountInfoPanel account={blockingAccount} />} placement='right'>
                <span className='blocking-account-avatar' style={
                  !blockingAccount.avatarUrl ? undefined :
                    { backgroundImage: `url(${blockingAccount.avatarUrl})` }
                }>@</span>

              <span className='blocking-account-handle'>{handle}</span>
              {' '}
              <FormatTimestamp
                timestamp={blocked_date}
                Component='span'
                className='blocking-date' />

              </Tooltip>
          )}>
          @<span className='blocking-account-handle'>{handle}</span>
          {' '}
          <FormatTimestamp
            timestamp={blocked_date}
            Component='span'
            className='blocking-date' />

        </AsyncLoad>
      </Link>
    </li>
  );

  return result;
}

/**
 * @param {{
 *  account: AccountInfo;
 * }} _
 */
function AccountInfoPanel({ account }) {
  return (
    <div className='account-info-panel'>
      <div>
        <span className='account-info-panel-avatar' style={
          !account.avatarUrl ? undefined :
            { backgroundImage: `url(${account.avatarUrl})` }
        } />
        {' '}
        <span className='account-info-panel-handle'>{account.displayName}</span>
      </div>
      <div>
        <span className='account-info-panel-handle'>@{account.handle}</span>
      </div>
      <div className='account-info-panel-bio'>
        {account.description}
      </div>
    </div>
  );
}

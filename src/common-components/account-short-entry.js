// @ts-check
/// <reference path="../types.d.ts" />

import React from 'react';

import { Tooltip } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import { resolveHandleOrDID, unwrapShortHandle } from '../api';
import { AsyncLoad } from './async-load';
import { FullHandle } from './full-short';
import { MiniAccountInfo } from './mini-account-info';

import './account-short-entry.css';

/**
 * @param {{
 *  handleOrDid: string,
 *  className?: string,
 *  link?: string,
 *  children?: React.ReactNode,
 *  customTooltip?: React.ReactNode,
 *  accountTooltipPanel?: boolean | React.ReactNode
 * }} _
 */
export function AccountShortEntry({
  handleOrDid,
  className,
  link,
  children,
  customTooltip,
  accountTooltipPanel,
  ...rest
}) {

  return (
    <AsyncLoad
      loadAsync={resolveHandleOrDID(handleOrDid)}
      renderAsync={account => {
        const avatarClass = account.avatarUrl ?
          'account-short-entry-avatar account-short-entry-avatar-image' :
          'account-short-entry-avatar account-short-entry-at-sign';
        const handle = (
          <>
            <span
              className={avatarClass}
              style={!account.avatarUrl ? undefined :
                { backgroundImage: `url(${account.avatarUrl})` }}>@</span>
            <FullHandle shortHandle={account.shortHandle} />
            {children}
          </>
        );

        const linkContent =
          customTooltip ?
            <FlushBackgroundTooltip title={customTooltip}>{handle}</FlushBackgroundTooltip> :
            accountTooltipPanel && !account.loading ?
              (
                <FlushBackgroundTooltip
                  title={
                    <MiniAccountInfo account={account} children={accountTooltipPanel} />
                  }>
                  {handle}
                </FlushBackgroundTooltip>
              ) :
              handle;

        return (
          <Link
            to={link || `/${unwrapShortHandle(account.shortHandle)}/history`}
            className={'account-short-entry ' + (className || '')}>
            {linkContent}
          </Link>
        );
      }}>
      <Link
        to={link || `/${unwrapShortHandle(handleOrDid)}/history`}
        className={'account-short-entry ' + (className || '')}>
        <span className='account-short-entry-avatar account-short-entry-at-sign'>@</span>
        <FullHandle shortHandle={handleOrDid} />
        {children}
      </Link>
    </AsyncLoad>
  );
}

const FlushBackgroundTooltip = withStyles({
  tooltip: {
    padding: '0',
    overflow: 'hidden'
  }
})(Tooltip);

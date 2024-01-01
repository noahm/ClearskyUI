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
import { useDerived } from './derive';

/**
 * @typedef {{
 *  account: Partial<AccountInfo> & { loading?: boolean };
 *  className?: string,
 *  link?: string,
 *  children?: React.ReactNode,
 *  customTooltip?: React.ReactNode,
 *  accountTooltipPanel?: boolean | React.ReactNode
 * }} Props
 */

/**
 * @param {Props} _
 */
export function AccountShortEntry({ account, ...rest}) {

  const loading = account.loading || !account.shortDID;

  const accountOrPromise = loading ?
    resolveHandleOrDID(/** @type {string} */(account.shortDID || account.shortHandle)) :
    account;
  
  if (!loading) return <ResolvedAccount {...rest} account={/** @type {AccountInfo} */(account)} />;

  return (
    <AsyncLoad
      loadAsync={accountOrPromise}
      renderAsync={account => <ResolvedAccount {...rest} account={account} />}>
      <LoadingAccount  {...rest} account={account} />
    </AsyncLoad>
  );
}

/**
 * @param {Props & { account: AccountInfo}} _
 */
function ResolvedAccount({
  account,
  className,
  link,
  children,
  customTooltip,
  accountTooltipPanel
}) {
  const avatarClass = account.avatarUrl ?
    'account-short-entry-avatar account-short-entry-avatar-image' :
    'account-short-entry-avatar account-short-entry-at-sign';
  const handle = (
    <span>
      <span
        className={avatarClass}
        style={!account.avatarUrl ? undefined :
          { backgroundImage: `url(${account.avatarUrl})` }}>@</span>
      <FullHandle shortHandle={account.shortHandle} />
      {children}
    </span>
  );

  const linkContent =
    customTooltip ?
      <FlushBackgroundTooltip title={customTooltip}>{handle}</FlushBackgroundTooltip> :
        accountTooltipPanel ?
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

}

/**
 * @param {Props} _
 */
function LoadingAccount({
  account,
  className,
  link,
  children
}) {
  return (
    <Link
      to={link || `/${unwrapShortHandle(account.shortHandle)}/history`}
      className={'account-short-entry ' + (className || '')}>
      <span className='account-short-entry-avatar account-short-entry-at-sign'>@</span>
      <FullHandle shortHandle={account.shortHandle} />
      {children}
    </Link>
  );
}

const FlushBackgroundTooltip = withStyles({
  tooltip: {
    padding: '0',
    overflow: 'hidden'
  }
})(Tooltip);

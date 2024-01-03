// @ts-check
/// <reference path="../types.d.ts" />

import React from 'react';

import { Tooltip } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import { isPromise, resolveHandleOrDID, unwrapShortHandle } from '../api';
import { AsyncLoad } from './async-load';
import { FullHandle } from './full-short';
import { MiniAccountInfo } from './mini-account-info';

import './account-short-entry.css';
import { useDerived } from './derive';

/**
 * @typedef {{
 *  account: string | Partial<AccountInfo> & { loading?: boolean };
 *  className?: string,
 *  contentClassName?: string,
 *  handleClassName?: string,
 *  link?: string,
 *  children?: React.ReactNode,
 *  customTooltip?: React.ReactNode,
 *  accountTooltipPanel?: boolean | React.ReactNode,
 *  accountTooltipBanner?: boolean | React.ReactNode
 * }} Props
 */

/**
 * @param {Props} _
 */
export function AccountShortEntry({ account, ...rest }) {

  const accountOrPromise =
    typeof account === 'string' ? resolveHandleOrDID(account) :
      account.loading || !account.shortDID ? resolveHandleOrDID(account.shortDID || /** @type {string} */(account.shortHandle)) :
        account;

  const loading = isPromise(accountOrPromise);

  if (!loading) return <ResolvedAccount {...rest} account={/** @type {AccountInfo} */(account)} />;

  return (
    <AsyncLoad
      loadAsync={accountOrPromise}
      renderAsync={account =>
        <ResolvedAccount {...rest} account={account} />}
      renderError={({error}) =>
        <ErrorAccount {...rest} error={error} handle={typeof account === 'string' ? account : account} />}>
      <LoadingAccount  {...rest} handle={typeof account === 'string' ? account : account.shortHandle} />
    </AsyncLoad>
  );
}

/**
 * @param {Props & { account: AccountInfo}} _
 */
function ResolvedAccount({
  account,
  className,
  contentClassName,
  handleClassName,
  link,
  children,
  customTooltip,
  accountTooltipPanel,
  accountTooltipBanner
}) {
  const avatarClass = account.avatarUrl ?
    'account-short-entry-avatar account-short-entry-avatar-image' :
    'account-short-entry-avatar account-short-entry-at-sign';
  const handle = (
    <span className={'account-short-entry-content ' + (contentClassName || '')}>
      <span className={'account-short-entry-handle ' + (handleClassName || '') }>
        <span
          className={avatarClass}
          style={!account.avatarUrl ? undefined :
            { backgroundImage: `url(${account.avatarUrl})` }}>@</span>
        <FullHandle shortHandle={account.shortHandle} />
      </span>
      {children}
    </span>
  );

  const linkContent =
    customTooltip ?
      <FlushBackgroundTooltip title={customTooltip}>{handle}</FlushBackgroundTooltip> :
      accountTooltipPanel || accountTooltipBanner ?
        (
          <FlushBackgroundTooltip
            title={
              <MiniAccountInfo
                account={account}
                children={accountTooltipPanel === true ? undefined : accountTooltipPanel}
                banner={accountTooltipBanner === true ? undefined : accountTooltipBanner} />
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
 * @param {{ error?: any, handle: string } & Props} _
 */
function ErrorAccount({
  handle,
  error,
  className,
  contentClassName,
  handleClassName,
  link,
  children
}) {
  const content = (
    <span className={'account-short-entry-content account-short-entry-error ' + (contentClassName || '')}>
      <span className={'account-short-entry-handle ' + (handleClassName || '')}>
        <span
          className='account-short-entry-avatar account-short-entry-at-sign'>@</span>
        <FullHandle shortHandle={handle} />
      </span>
      {children}
    </span>
  );

  const removedAccount =
    /not found/i.test(error.message || '') ||
    /resolve handle/i.test(error.message || '');
  if (removedAccount) return (
    <span className={'account-short-entry ' + (className || '')}>
      {content}
    </span>
  );

  return (
    <Link
      to={link || `/${unwrapShortHandle(handle)}/history`}
      className={'account-short-entry ' + (className || '')}>
      {content}
    </Link>
  );
}

/**
 * @param {{handle?: string, account: AccountInfo} & Props} _
 */
function LoadingAccount({
  handle,
  className,
  contentClassName,
  handleClassName,
  link,
  children
}) {
  return (
    <Link
      to={link || `/${unwrapShortHandle(handle)}/history`}
      className={'account-short-entry ' + (className || '')}>
      <span className={'account-short-entry-content account-short-entry-error ' + (contentClassName || '')}>
        <span className={'account-short-entry-handle ' + (handleClassName || '')}>
          <span
            className='account-short-entry-avatar account-short-entry-at-sign'>@</span>
          <FullHandle shortHandle={handle} />
        </span>
        {children}
      </span>
    </Link>
  );
}

const FlushBackgroundTooltip = withStyles({
  tooltip: {
    padding: '0',
    overflow: 'hidden'
  }
})(Tooltip);

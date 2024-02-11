// @ts-check
/// <reference path="../types.d.ts" />

import React from 'react';

import { Tooltip } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import { isPromise, likelyDID, resolveHandleOrDID, unwrapShortHandle } from '../api';
import { FullHandle } from './full-short';
import { MiniAccountInfo } from './mini-account-info';

import './account-short-entry.css';
import { forAwait } from './for-await';
import { useResolveAccount } from './use-resolve-account';

/**
 * @typedef {{
 *  account: string | Partial<AccountInfo> & { loading?: boolean },
 *  withDisplayName?: boolean,
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

  const resolved = useResolveAccount(account);
  if (!resolved) return undefined;
  
  if (resolved.loading) return (
    <LoadingAccount  {...rest} handle={resolved.shortHandle} />
  );
  else if (resolved.error) return (
    <ErrorAccount {...rest} error={resolved.error} handle={resolved.shortHandle} />
  );
  else return (
    <ResolvedAccount {...rest} account={resolved} />
  );
}

/**
 * @param {Props & { account: Partial<AccountInfo>}} _
 */
function ResolvedAccount({
  account,
  withDisplayName,
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
  const handleWithContent = (
    <span className={'account-short-entry-content ' + (contentClassName || '')}>
      <span className={'account-short-entry-handle ' + (handleClassName || '')}>
        <span
          className={avatarClass}
          style={!account.avatarUrl ? undefined :
            { backgroundImage: `url(${account.avatarUrl})` }}>@</span>
        <FullHandle shortHandle={account.shortHandle} />
        {
          !withDisplayName || !account.displayName ? undefined :
            <>
              {' '}<span className='account-short-entry-display-name'>
                {account.displayName}
              </span>
            </>
        }
      </span>
      {children}
    </span>
  );

  const linkContent =
    customTooltip ?
      <FlushBackgroundTooltip title={customTooltip}>{handleWithContent}</FlushBackgroundTooltip> :
      accountTooltipPanel || accountTooltipBanner ?
        (
          <FlushBackgroundTooltip
            title={
              <MiniAccountInfo
                account={account}
                children={accountTooltipPanel === true ? undefined : accountTooltipPanel}
                banner={accountTooltipBanner === true ? undefined : accountTooltipBanner} />
            }>
            {handleWithContent}
          </FlushBackgroundTooltip>
        ) :
        handleWithContent;

  return (
    <Link
      to={link || `/${unwrapShortHandle(account.shortHandle)}/history`}
      className={'account-short-entry ' + (className || '')}>
      {linkContent}
    </Link>
  );

}

/**
 * @param {{ error?: any, handle: string | undefined } & Omit<Props, 'account'>} _
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
  const at = likelyDID(handle) ? '\u24d3' : '@';
  const content = (
    <span className={'account-short-entry-content account-short-entry-error ' + (contentClassName || '')}>
      <span className={'account-short-entry-handle ' + (handleClassName || '')}>
        <span
          className='account-short-entry-avatar account-short-entry-at-sign'>{at}</span>
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
 * @param {{ handle?: string } & Omit<Props, 'account'>} _
 */
function LoadingAccount({
  handle,
  className,
  contentClassName,
  handleClassName,
  link,
  children
}) {
  const at = likelyDID(handle) ? '\u24d3' : '@';
  return (
    <Link
      to={link || `/${unwrapShortHandle(handle)}/history`}
      className={'account-short-entry ' + (className || '')}>
      <span className={'account-short-entry-content account-short-entry-loading ' + (contentClassName || '')}>
        <span className={'account-short-entry-handle ' + (handleClassName || '')}>
          <span
            className='account-short-entry-avatar account-short-entry-at-sign'>{at}</span>
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

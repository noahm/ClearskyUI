// @ts-check
/// <reference path="../types.d.ts" />

import React from 'react';
import { shortenDID, shortenHandle } from '../api';

import './account-header.css';

/**
 * @param {{
 *  className?: string,
 *  account: Partial<AccountInfo> & { loading?: boolean },
 *  onCloseClick?: () => void
 * }} _ 
 */
export function AccountHeader({ className, account, onCloseClick }) {

  return (
    <div className={className}>
      <h1 style={{ margin: 0 }}>
        {
          typeof onCloseClick !== 'function' ? undefined :
            <button
              className='account-close-button'
              onClick={onCloseClick}>&lsaquo;</button>
        }

        <div className='account-banner' style={{
          backgroundImage: account.bannerUrl ? `url(${account.bannerUrl})` : 'transparent'
        }}>
        </div>

        <span className='account-avatar-and-displayName-line'>
          <span className='account-banner-overlay'></span>
          <span className='account-avatar' style={{
            backgroundImage: account.avatarUrl ? `url(${account.avatarUrl})` : 'transparent'
          }}></span>
          <span className='account-displayName'>
            {
              account.displayName ||
              <span style={{ opacity: '0.5' }}>{account.handle}</span>
            }
          </span>
          {
            !account.displayName ? undefined :
              <span className='account-handle'>
                <span className='account-handle-at'>@</span>
                {
                  shortenHandle(account.handle) === account.handle ? account.handle :
                    <>
                      {shortenHandle(account.handle)}
                      <span className='account-handle-suffix'>.bsky.social</span>
                    </>
                }
              </span>
          }
          {
            !account.did ? undefined :
              <span className='account-did'>
                {
                  shortenDID(account.did) === account.did ? account.did :
                    <>
                      <span className='account-did-prefix'>did:plc:</span>
                      {shortenDID(account.did)}
                    </>
                }
              </span>
          }
        </span>
      </h1>
    </div>
  );
}

// @ts-check
/// <reference path="../types.d.ts" />

import React from 'react';

import { shortenDID, shortenHandle } from '../api';

import './mini-account-info.css';

/**
 * @param {{
 *  banner?: React.ReactNode,
 *  className?: string,
 *  account: AccountInfo,
 *  details?: React.ReactNode
 * }} _
 */
export function MiniAccountInfo({
  className,
  account,
  banner,
  details }) {
  return (
    <div className={'mini-account-info ' + className}>
      <h3>
        <div className='account-banner' style={{
          backgroundImage: account.bannerUrl ? `url(${account.bannerUrl})` : 'transparent'
        }}>
          {banner}
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
      </h3>

      <div className='account-info-panel-description'>
        {details || account.description}
      </div>
    </div>
  );
}

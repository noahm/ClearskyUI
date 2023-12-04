// @ts-check
/// <reference path="../types.d.ts" />

import React from 'react';
import { shortenDID, shortenHandle } from '../api';
import { AsyncLoad } from '../common-components/async-load';

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
      <style dangerouslySetInnerHTML={{
        __html: `
.account-banner {
  height: 150px;
  background: no-repeat center center;
  background-size: cover;
}

.account-close-button {
  float: left;
  cursor: pointer;
  background: transparent;
  border: none;
  outline: none;
  color: white;
  text-shadow: -1px -1px 2px #00000075, 1px 2px 2px #00000075, -1px 1px 2px #00000075, 1px -1px 2px #00000075;
  font-size: 80%;

  position: sticky;
  top: -0.1em;
}

.account-avatar-and-displayName-line {
  display: grid;
  margin-top: -1em;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: 1fr 1fr;
}

.account-avatar-and-displayName-line .account-banner-overlay {
  grid-row: 1/2;
  grid-column: 1/4;
  background: linear-gradient(0.8deg, white -0.25em, transparent 1.15em);
}

.account-avatar-and-displayName-line .account-avatar {
  grid-row: 1/3;
  grid-column: 1/2;
  width: 2em;
  height: 2em;
  border-radius: 200%;
  background: white;
  margin-right: 0.5em;
  margin-left: 0.5em;
  background: no-repeat center center;
  background-size: cover;
  border: solid 0.07em white;
}

.account-avatar-and-displayName-line .account-displayName {
  grid-row: 1/2;
  grid-column: 2/4;
  text-shadow: 1px 1px 13px white, 1px 1px 2px #fffffff2, -1px -1px 2px #ffffffe6;
  font-size: 90%;
  white-space: nowrap;
  position: relative;
  top: -0.02em;
}

.account-avatar-and-displayName-line .account-handle {
  grid-row: 2/3;
  grid-column: 2/3;
  font-size: 45%;
  font-weight: normal;
  color: #5c85cf;
}

.account-avatar-and-displayName-line .account-handle .account-handle-at {
  color: #adadad;
}

.account-avatar-and-displayName-line .account-handle .account-handle-suffix {
  color: #979797;
}

.account-avatar-and-displayName-line .account-did {
  grid-row: 2/3;
  grid-column: 3/4;
  justify-self: end;
  font-size: 37%;
  font-weight: normal;
  margin-right: 0.5em;
  color: gray;
  transform: scaleY(1.2) translateY(0.21em);
}

.account-avatar-and-displayName-line .account-did .account-did-prefix {
  opacity: 0.6;
}

        `}} />
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

// @ts-check
/// <reference path="../types.d.ts" />

import React, { useState } from 'react';
import { shortenDID, shortenHandle } from '../api';

import './account-header.css';
import { FullDID, FullHandle } from '../common-components/full-short';

/**
 * @param {{
 *  className?: string,
 *  account: Partial<AccountInfo> & { loading?: boolean },
 *  onCloseClick?: () => void
 * }} _ 
 */
export function AccountHeader({ className, account, onCloseClick }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleShortDIDClick = () => {
    // Copy the shortDID to the clipboard
    const modifiedShortDID = `did:plc:${account.shortDID}`;
    const textField = document.createElement('textarea');
    textField.innerText = modifiedShortDID;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();

    // Show the "Copied to Clipboard" message
    setIsCopied(true);

    // Hide the message after a delay (e.g., 3 seconds)
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

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
              <span style={{ opacity: '0.5' }}><FullHandle shortHandle={account.shortHandle} /></span>
            }
          </span>
          {
            !account.displayName ? undefined :
              <span className='account-handle'>
                <span className='account-handle-at'>@</span>
                <a href={`https://bsky.app/profile/${account.shortHandle}`} target="_blank">
                <FullHandle shortHandle={account.shortHandle} />
              </a>
              </span>
          }
          {
            !account.shortDID ? undefined :
              <span className='account-did' onClick={handleShortDIDClick}>
                <FullDID shortDID={account.shortDID} />
                {isCopied && <span style={{ marginLeft: '5px', color: 'green' }}>Copied to Clipboard</span>}
              </span>
          }
        </span>
      </h1>
    </div>
  );
}

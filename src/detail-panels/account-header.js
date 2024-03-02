// @ts-check
/// <reference path="../types.d.ts" />

import React, { useState } from 'react';

import { ContentCopy, HistoryToggleOff } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';

import { unwrapShortDID, unwrapShortHandle } from '../api';
import { FormatTimestamp } from '../common-components/format-timestamp';
import { FullDID, FullHandle } from '../common-components/full-short';

import './account-header.css';
import { localise } from '../localisation';

/**
 * @param {{
 *  className?: string,
 *  account: Partial<AccountInfo> & { loading?: boolean },
 *  handleHistory?: [handle: string, date: string][],
 *  onCloseClick?: () => void
 * }} _ 
 */
export function AccountHeader({
  className,
  account,
  handleHistory,
  onCloseClick }) {
  const [isCopied, setIsCopied] = useState(false);
  const [handleHistoryExpanded, setHandleHistoryExpanded] = useState(false);

  const handleShortDIDClick = () => {
    // Copy the shortDID to the clipboard
    const modifiedShortDID = unwrapShortDID(account.shortDID);
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
              title={localise('Back to homepage', { uk: 'Повернутися до головної сторінки' })}
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
                <a href={`https://bsky.app/profile/${unwrapShortHandle(account.shortHandle)}`} target="_blank">
                  <FullHandle shortHandle={account.shortHandle} />
                </a>
              </span>
          }
          {
            !account.shortDID ? undefined :
              <Tooltip
                title={
                  isCopied ?
                    localise('DID: copied to Clipboard', { uk: 'DID-код: скопійовано в буфер обміну' }) :
                    <HandleHistory handleHistory={handleHistory} />
                }
                placement='bottom-start'
                open={!!isCopied || ((handleHistory?.length || 0) > 1 && handleHistoryExpanded)}>
                <span className='account-did'>
                  <span className='history-toggle'>
                    {
                      !handleHistory?.length ? undefined :
                        handleHistory.length === 1 ?
                          <FormatTimestamp timestamp={handleHistory[handleHistory.length - 1][1]} /> :
                          <Button
                            title={localise('Handle history', { uk: 'Показати історію nickname' })}
                            size='small' onClick={() => setHandleHistoryExpanded(!handleHistoryExpanded)}>
                            <HistoryToggleOff />
                            <FormatTimestamp timestamp={handleHistory[handleHistory.length - 1][1]} noTooltip />
                          </Button>
                    }
                  </span>

                  <Button
                    className='copy-account-did'
                    size='small'
                    onClick={handleShortDIDClick}>
                    <ContentCopy />
                  </Button>
                  <FullDID className='did' shortDID={account.shortDID} />
                </span>
              </Tooltip>
          }
        </span>
      </h1>
      <div>
      </div>
    </div>
  );
}

/**
 * @param {{
 * handleHistory?: [handle: string, date: string][]
 * }} _
 */
function HandleHistory({ handleHistory }) {
  if (!handleHistory?.length) return undefined;

  return (
    <div>
      {handleHistory.map(([handle, date], index) => (
        <div key={index}>
          <FullHandle shortHandle={handle} />{' '}<FormatTimestamp timestamp={date} noTooltip />
        </div>
      ))}
    </div>
  );
}

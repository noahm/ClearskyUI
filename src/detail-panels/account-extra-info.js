// @ts-check

import React from 'react';

import './account-extra-info.css';
import { FullDID, FullHandle } from '../common-components/full-short';
import { FormatTimestamp } from '../common-components/format-timestamp';
import { Button } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { unwrapShortDID } from '../api';

/**
 * @param {{
 *  account: AccountInfo,
 *  handleHistory?: import('../api/handle-history').HandleHistoryResponse['handle_history'],
 *  className?: string
 * }} _
 */
export function AccountExtraInfo({ className, account, handleHistory, ...rest }) {
  return (
    <div className={'account-extra-info ' + (className || '')} {...rest}>
      <div className='bio-section'>
        {
          !account?.description ? undefined :
            <MultilineFormatted text={account.description} />
        }
      </div>
      <div className='did-section'>
        <DidWithCopyButton account={account} />
      </div>
      <div className='handle-history-section'>
        {
          !handleHistory ? undefined :
            <HandleHistory handleHistory={handleHistory} />
        }
      </div>
    </div>
  );
}

function DidWithCopyButton({ account }) {
  const [isCopied, setIsCopied] = React.useState(false);

  return (
    <>
      <FullDID shortDID={account.shortDID} />
      {isCopied ?
        <div className='copied-to-clipboard'>Copied to Clipboard</div> :
        <Button className='copy-did' onClick={() => handleCopyDid(account)}>
          <ContentCopy />
        </Button>
      }
    </>
  );

  function handleCopyDid(account) {
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
  }
}


function MultilineFormatted({ text, lineClassName = 'text-multi-line' }) {
  if (!text) return undefined;
  const lines = text.split('\n');
  const lineElements = [];
  for (const ln of lines) {
    if (!ln) lineElements.push(<div key={lineElements.length} style={{ height: '0.5em' }}></div>);
    else lineElements.push(<Line key={lineElements.length} text={ln} className={lineClassName} />);
  }

  return lineElements;
}

function Line({ text, className }) {
  const textWithSpaces = text.replace(/  /g, ' \u00a0');
  return <div className={className}>{textWithSpaces}</div>
}

/**
 * @param {{
 *  handleHistory: import('../api/handle-history').HandleHistoryResponse['handle_history'],
 * }} _
 */
function HandleHistory({ handleHistory }) {
  /** @type {string | undefined} */
  let lastHandle;
  /** @type {string | undefined} */
  let lastPds;
  const entries = handleHistory.slice().reverse().map(([handle, date, pds], i) => {
    const entryLayout = (
      <div key={date + '\n' + i} className='handle-history-entry'>
        <FormatTimestamp className='handle-history-timestamp' timestamp={date} noTooltip />
        {
          handle && (handle !== lastHandle) ?
            <FullHandle className='handle-history-handle' shortHandle={handle} /> : undefined
        }
        {
          pds && (pds !== lastPds) ?
            <span className='handle-history-pds'>
              <span className='handle-history-pds-icon'>
                {
                  pds.endsWith('bsky.network') ? '🍄' :
                    pds.endsWith('bsky.social') ? '🏠' :
                      '✨'
                }
              </span>
              {pds.replace(/^https:\/\//, '')}
            </span> : undefined
        }
        {
          handle === lastHandle && pds === lastPds ?
            <span className='handle-history-same'>recycled</span>
          : undefined
        }
      </div>
    );

    if (handle) lastHandle = handle;
    if (pds) lastPds = pds;
    return entryLayout;
  });

  return <>{entries}</>;
}
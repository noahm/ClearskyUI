// @ts-check

import React from 'react';

import './account-extra-info.css';

/**
 * @param {{
 *  account: AccountInfo,
 * }} _
 */
export function AccountExtraInfo({ account }) {
  return (
    <div className='account-extra-info'>
      {
        !account?.description ? undefined :
          <MultilineFormatted text={account.description} />
      }
    </div>
  );
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

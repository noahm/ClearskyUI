// @ts-check

import React from 'react';

import './pds-name.css';

/**
 * @param {{
 *  className?: string,
 *  pds: string
 * }} _
 */
export function PDSName({ className, pds }) {
  const type =
    pds.endsWith('bsky.network') ? '🍄' :
      pds.endsWith('bsky.social') ? '🏠' :
        <img className='pds-image-icon' src={'https://icon.horse/icon/' + pds.replace(/^https:\/\//, '')} />;

  const leadLength = /^https:\/\//.exec(pds)?.[0]?.length || 0;
  const tailLength = /(\.host\.)?bsky\.network$/.exec(pds)?.[0]?.length || 0;

  const lead = pds.slice(0, leadLength);
  const tail = pds.slice(pds.length - tailLength);
  const middle = pds.slice(leadLength, pds.length - tailLength);

  return (
    <span className={'handle-history-pds ' + (className || '')}>
      <span className='pds-prefix'>PDS: </span>
      <span className='pds-name-and-icon'>
        <span className='pds-icon'>
          {type}
        </span>
        <span className='pds-name'>
          {
            !lead ? undefined :
              <span className='pds-name-lead'>{lead}</span>
          }
          {middle}
          {
            !tail ? undefined :
              <span className='pds-name-tail'>{tail}</span>
          }
        </span>
      </span>
    </span>
  );
}
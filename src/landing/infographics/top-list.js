// @ts-check

/// <reference path="../../types.d.ts" />

import React, { useState } from 'react';

import { AccountShortEntry } from '../../common-components/account-short-entry';
import { parseNumberWithCommas } from '../../api/core';

import './top-list.css'
import { Switch } from '@mui/material';

const DEFAULT_LIMIT = 5;

/**
 * @param {{
 *  className?: string,
 *  header?: React.ReactNode | ((list: DashboardBlockListEntry[]) => React.ReactNode),
 *  list: DashboardBlockListEntry[] | undefined,
 *  list24: DashboardBlockListEntry[] | undefined,
 *  limit?: number
 * }} _
 */
export function TopList({
  className,
  header,
  list, list24,
  limit = DEFAULT_LIMIT }) {
  const [expanded, setExpanded] = useState(/** @type {boolean | undefined } */(undefined));
  const [see24, setSee24] = useState(/** @type {boolean | undefined } */(undefined));

  const useList = see24 ? list24 : list;

  const blockedSlice =
    !useList ? [] :
      expanded ? useList :
        useList?.slice(0, limit);

  return (
    <div className={'top-list ' + (className || '')}>
      <h2 className='top-list-header'>
        {
          typeof header === 'function' ? header(blockedSlice) :
            header || defaultHeader(blockedSlice)
        }
        <span className='top-list-24h-toggle-container'>
          <Switch value={!!see24} onChange={() => setSee24(!see24)} size='small' /> <br />
          <span className='top-list-24h-toggle-label'
          onClick={() => setSee24(!see24)}>
            last 24h
          </span>
        </span>
      </h2>
      <div className='top-list-entries'>
        {
          !useList ? 'Loading...' :
          blockedSlice.map((blockEntry, index) =>
            <BlockListEntry key={blockEntry.did + '-' + (className || '') + '-' + index} entry={blockEntry} />)
        }
        {
          useList && useList.length > limit ?
            <div className='top-list-more' onClick={() => setExpanded(!expanded)}>
              <span>...see top-{useList.length}</span>
            </div> :
            undefined
        }
      </div>
    </div>
  );
}

/**
 * @param {DashboardBlockListEntry[]} list
 */
function defaultHeader(list) {
  return <>
    Top {list?.length || undefined} Blocked
  </>;
}

/** @param {{ entry: DashboardBlockListEntry }} */
function BlockListEntry({ entry }) {
  return (
    <div className='top-list-entry'>
      <AccountShortEntry
        account={{
          shortDID: entry.did,
          shortHandle: entry.Handle,
          loading: true
        }}
        contentClassName='top-list-entry-content'
        accountTooltipPanel >
        <span className='top-list-entry-count'>
          {parseNumberWithCommas(entry.block_count)?.toLocaleString()}
        </span>
      </AccountShortEntry>
    </div>
  );
}
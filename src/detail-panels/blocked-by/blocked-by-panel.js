// @ts-check

import React, { Component } from 'react';
import { singleBlocklist, unwrapShortHandle } from '../../api';
import { MiniAccountInfo } from '../../common-components/mini-account-info';
import { ListView } from './list-view';
import { TableView } from './table-view';

import './blocked-by-panel.css';
import { useDerived } from '../../common-components/derive';

/**
 * @this {never}
 * @param {{
 *  account: AccountInfo | { shortHandle: String, loading: true }
 * }} _
 */
export function BlockedByPanel({ account }) {
  const { count, blocklist, loading } =
    useDerived(account?.shortHandle, fetchAccountBlocking) ||
    { loading: true };
  
  const [tableView, setTableView] = React.useState(false);

  return (
    <div style={{
      backgroundColor: '#fefafa',
      backgroundImage: 'linear-gradient(to bottom, white, transparent 2em)',
      minHeight: '100%'
    }}>
      {count ?
        <h3 className='blocking-panel-header'>Blocked by {count}:</h3> :
        ''
      }
      {
        loading && !blocklist?.length ?
          'Loading...' :
          tableView ?
            <TableView
              account={account}
              blocklist={blocklist} /> :
            <ListView
              account={account}
              blocklist={blocklist} />
      }
    </div>
  );
}

async function* fetchAccountBlocking(shortHandle) {

  let blocklist = [];
  for await (const block of singleBlocklist(unwrapShortHandle(shortHandle))) {
    if (block.blocklist)
      blocklist = blocklist.concat(block.blocklist);

    yield {
      count: block.count,
      blocklist,
      loading: true
    };
  }
 
  yield {
    count: blocklist.length,
    blocklist,
    loading: false
  };
}

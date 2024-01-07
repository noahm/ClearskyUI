// @ts-check

import React from 'react';

import { singleBlocklist, unwrapShortHandle } from '../../api';
import { forAwait } from '../../common-components/for-await';
import { ListView } from './list-view';
import { TableView } from './table-view';

import './block-panel-generic.css';

/**
 * @this {never}
 * @param {{
 *  className?: string,
 *  fetch: typeof singleBlocklist,
 *  account: AccountInfo | { shortHandle: String, loading: true },
 *  header?: React.ReactNode | ((args: { count, blocklist: any[] }) => React.ReactNode)
 * }} _
 */
export function BlockPanelGeneric({
  className,
  fetch,
  account,
  header
}) {
  const { count, blocklist, loading } =
    forAwait(account?.shortHandle, (shortHandle) => fetchAccountBlocking(shortHandle, fetch)) ||
    { loading: true };

  const [tableView, setTableView] = React.useState(false);

  return (
    <div className={className} style={{
      backgroundColor: '#fefafa',
      backgroundImage: 'linear-gradient(to bottom, white, transparent 2em)',
      minHeight: '100%'
    }}>
      {count ?
        <h3 className='block-panel-header'>{
          !header ? <>Blocked by {count}:</> :
            typeof header === 'function' ? header({ count, blocklist }) :
              header
          }</h3> :
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

/** @param {typeof singleBlocklist} fetch */
async function* fetchAccountBlocking(shortHandle, fetch) {
  try {
  let blocklist = [];
    for await (const block of fetch(unwrapShortHandle(shortHandle))) {
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
  } finally {
    console.log('fetch account blocking finished');
  }
}

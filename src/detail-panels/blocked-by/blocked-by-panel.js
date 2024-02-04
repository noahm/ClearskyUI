// @ts-check

import React from 'react';

import { singleBlocklist, unwrapShortHandle } from '../../api';
import { forAwait } from '../../common-components/for-await';
import { ListView } from './list-view';
import { TableView } from './table-view';

import './blocked-by-panel.css';

/**
 * @this {never}
 * @param {{
 *  account: AccountInfo | { shortHandle: String, loading: true }
 * }} _
 */
export function BlockedByPanel({ account }) {
  const { count, blocklist, loading } =
    forAwait(account?.shortHandle, fetchAccountBlocking) ||
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
        <h3 className='blocking-panel-header'>Blocked by <FunnyCounter />:</h3>
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
  try {
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
  } finally {
    console.log('fetch account blocking finished');
  }
}

function FunnyCounter() {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    let direction = +1;
    const interval = setInterval(() => {
      if (!count) direction = +1;
      else if (direction > 0 && count > 400 && Math.random() > 0.9) direction = -direction;
      setCount(count => count + direction);
    }, 200);
    return () => clearInterval(interval);
  }, []);
  return <span>{count}</span>;
}

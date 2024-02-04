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
      <PanelHeader count={count} blocklist={blocklist} header={header} />
      {
        loading && !blocklist?.length ?
          <p style={{ padding: '0.5em', opacity: '0.5' }}>Loading...</p> :
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

class PanelHeader extends React.Component {
  direction = +1;

  render() {
    let count = this.props.count;
    if (typeof this.props.count !== 'number') {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.forceUpdate(), 10);
      count = this.state?.count || 0;
      if (!this.state) this.state = { count: 0 };
    }

    const { blocklist, header } = this.props;

    return (
      <h3 className={'blocking-panel-header' + (typeof this.props.count === 'number' ? '' : ' blocking-panel-header-loading')}>
        {typeof header === 'function' ?
          header({ count, blocklist }) :
          header
        }
      </h3>
    );
  }

  forceUpdate = () => {
    let count = Math.max(0, (this.state?.count || 0) + this.direction);
    this.setState({ count });
    if (count === 0) this.direction = +1;
    else if (count > 300 && this.direction > 0 && Math.random() > 0.9)
      this.direction = -1;
  };
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

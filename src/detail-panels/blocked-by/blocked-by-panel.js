// @ts-check

import React, { Component } from 'react';
import { isPromise, postHistory, singleBlocklist } from '../../api';
import { TableView } from './table-view';
import { ListView } from './list-view';

import './blocked-by-panel.css';

const blockingListPerShortDID = {};

/**
 * @extends {React.Component<{
 *  account?: AccountInfo,
 * }, { count: number, blocklist: BlockedByRecord[], tableView: boolean }>} _
 */
export class BlockedByPanel extends Component {

  /**
   * @type {{ account: AccountInfo, fetching: Promise | undefined } | undefined}
   */
  fetchingAccount

  render() {

    if (!this.fetchingAccount || this.fetchingAccount?.account?.handle !== this.props.account?.handle) {
      if (!this.props.account) {
        this.fetchingAccount = undefined;
      } else {
        this.fetchingAccount = {
          account: this.props.account,
          fetching: this.fetchAccountBlocking()
        };
      }
    }

    return (
      <div style={{
        backgroundColor: '#fefafa',
        backgroundImage: 'linear-gradient(to bottom, white, transparent 2em)',
        minHeight: '100%'
      }}>
        {this.state?.count ?
          <h3 className='blocking-panel-header'>{this.state.count} blocking:</h3> :
          ''
        }
        {
          !this.state?.blocklist || !this.props.account ?
            (this.fetchingAccount?.fetching ?
              'Loading...' :
              'No blocks found.') :
            this.state?.tableView ?
              <TableView
                account={this.props.account}
                blocklist={this.state.blocklist} /> :
              <ListView
                account={this.props.account}
                blocklist={this.state.blocklist} />
        }
      </div>
    );
  }

  async fetchAccountBlocking() {
    const account = this.props.account;
    if (!account) return;

    for await (const block of singleBlocklist(account.handle)) {
      if (account !== this.props.account) return;

      this.setState({
        count: block.count,
        blocklist: this.state?.blocklist ?
          this.state.blocklist.concat(block.blocklist) :
          block.blocklist
      });
    }
  }
}

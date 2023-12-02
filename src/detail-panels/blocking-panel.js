// @ts-check

import React, { Component } from 'react';
import { isPromise, postHistory, singleBlocklist } from '../api';

const blockingListPerShortDID = {};

/**
 * @extends {React.Component<{
 *  account?: AccountInfo,
 * }, { block_list: { blocked_date: string, handle: string }[], tableView: boolean }>} _
 */
export class BlockingPanel extends Component {

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
        background: 'tomato',
        backgroundColor: '#fffcf5',
        backgroundImage: 'linear-gradient(to bottom, white, transparent 2em)',
        minHeight: '100%'
      }}>
        {
          !this.state?.block_list ?
            (this.fetchingAccount?.fetching ?
              'Loading...' :
              'No blocks found.') :
            this.state?.tableView ?
              <TableView
                account={this.props.account}
                block_list={this.state.block_list} /> :
              <ListView
                account={this.props.account}
                block_list={this.state.block_list} />
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
        block_list: this.state?.block_list ?
          this.state.block_list.concat(block.block_list) :
          block.block_list
      });
    }
  }
}

function TableView({ account, block_list }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Blocked</th>
          <th>Handle</th>
        </tr>
      </thead>
      <tbody>
        {
          block_list.map(block => (
            <tr>
              <td>{block.blocked_date}</td>
              <td>{block.handle}</td>
            </tr>
          ))
        }
      </tbody>
    </table>
  );
}

function ListView({ account, block_list }) {
  return (
    <ul>
      {
        block_list.map(block => (
          <li>
            <div>{block.blocked_date}</div>
            <div>{block.handle}</div>
          </li>
        ))
      }
    </ul>
  );
}

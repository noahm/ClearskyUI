// @ts-check

import React, { Component } from 'react';
import { isPromise, postHistory, singleBlocklist } from '../../api';

import './blocking-panel.css';

const blockingListPerShortDID = {};

/**
 * @extends {React.Component<{
 *  account?: AccountInfo,
 * }, { blocklist: BlockedByRecord[], tableView: boolean }>} _
 */
export class BlockingPanel extends Component {

  render() {

    return (
      <div style={{
        background: 'tomato',
        backgroundColor: '#fffcf5',
        backgroundImage: 'linear-gradient(to bottom, white, transparent 2em)',
        minHeight: '100%'
      }}>
        Blocking some accounts?
      </div>
    );
  }

  async fetchAccountBlocking() {
    const account = this.props.account;
    if (!account) return;

    for await (const block of singleBlocklist(account.handle)) {
      if (account !== this.props.account) return;

      this.setState({
        blocklist: this.state?.blocklist ?
          this.state.blocklist.concat(block.blocklist) :
          block.blocklist
      });
    }
  }
}

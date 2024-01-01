// @ts-check

import React, { Component, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { isPromise, resolveHandleOrDID, shortenHandle, unwrapShortHandle } from '../api';

import { AccountHeader } from './account-header';
import { BlockedByPanel } from './blocked-by';
import { BlockingPanel } from './blocking';
import { HistoryPanel } from './history/history-panel';
import { TabSelector } from './tab-selector';
import { AccountResolver } from './account-resolver';

import './layout.css';

export const accountTabs = /** @type {const} */(['blocked-by', 'blocking', 'followers', 'history']);

export function AccountLayout() {
  let { tab } = useParams();
  if (!tab) tab = accountTabs[0];

  const navigate = useNavigate();

  return (
    <AccountResolver.Consumer>
      {account => <AccountLayoutCore
        account={account}
        selectedTab={tab}
        onSetSelectedTab={(selectedTab) => {
          navigate(
            '/' + unwrapShortHandle(account?.shortHandle) +
            '/' + selectedTab,
            { replace: true });
        }}
        onCloseClick={() => {
          navigate('/');
        }} />}
    </AccountResolver.Consumer>
  );
}

export class AccountLayoutCore extends Component {

  materializedTabs = {};

  render() {

    const selectedTab = this.props.selectedTab;

    return (
      <>
        <div className="layout">

          <AccountHeader
            account={this.props.account}
            className='account-header'
            onCloseClick={this.props.onCloseClick} />

          <TabSelector
            className='account-tabs-handles'
            tab={selectedTab}
            onTabSelected={selectedTab => this.props.onSetSelectedTab(selectedTab)} />

          <div className='account-tabs-content'>

            {
              accountTabs.map(tab => {
                if (tab === selectedTab && !this.materializedTabs[tab])
                  this.materializedTabs[tab] = () => renderTabContent(tab, this.props.account);

                const tabContentRender = this.materializedTabs[tab];
                if (!tabContentRender) return undefined;

                return (
                  <div key={tab} className={
                    'account-tab ' + (tab === selectedTab ? 'account-tab-selected' : '')}>
                    {tabContentRender()}
                  </div>
                );
              })
            }

          </div>
        </div>


      </>
    );
  }
}

function renderTabContent(tab, account) {
  switch (tab) {
    case 'blocked-by': return <BlockedByPanel account={account} />
    case 'blocking': return <BlockingPanel account={account} />;
    // case 'followers': return <div>followers</div>;
    case 'history': return <HistoryPanel account={account} />;

    default: return (
      <>
        <button>123</button><br />
        grid <br />
        grid <br />
        grid <br />
        grid <br />
        grid <br />
        grid <br />
        grid <br />
        grid <br />
        grid <br />
        grid <br />
        grid
      </>
    );
  }
}

// @ts-check
import { Tab, Tabs } from '@mui/material';
import React, { Component, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isPromise, resolveHandleOrDID } from '../api';
import { AccountHeader } from './account-header';
import { BlockedByPanel } from './blocked-by';
import { BlockingPanel } from './blocking';
import { HistoryPanel } from './history/history-panel';
import { TabSelector } from './tab-selector';

export const accountTabs = /** @type {const} */(['blocked-by', 'blocking', 'followers', 'history']);

export function AccountLayout() {
  let { handle, tab } = useParams();
  if (!tab) tab = accountTabs[0];

  let accountResolution = resolveHandleOrDID(handle || '');
  if (!isPromise(accountResolution)) handle = accountResolution.handle;

  const [account, setAccount] = useState(
    isPromise(accountResolution) ? { handle, loading: true } : accountResolution
  );

  if (isPromise(accountResolution)) {
    (async () => {
      const resolved = await accountResolution;
      setAccount(resolved);
    })();
  }

  const navigate = useNavigate();

  return (
    <AccountLayoutCore
      account={account}
      selectedTab={tab}
      onSetSelectedTab={(selectedTab) => {
        navigate('/' + handle + '/' + selectedTab, { replace: true });
      }}
      onCloseClick={() => {
        navigate('/');
      }} />
  );
}

export class AccountLayoutCore extends Component {

  materializedTabs = {};

  render() {

    const selectedTab = this.props.selectedTab;

    return (
      <>
        <style dangerouslySetInnerHTML={{
          __html: `
        .layout {
          position: fixed;
          left: 0; top: 0;
          width: 100%; height: 100%;

          display: grid;
          grid-template-columns: 1fr 1fr auto;
          grid-template-rows: 1fr 1fr;
        }

        .account-title {
          grid-column: 1 / 2;
          grid-row: 1 / 2;
          align-self: end;
        }

        .account-tabs-handles {
          grid-row: 1 / 3;
          grid-column: 3 / 4;
          border-left: solid 1px #ededed;
          background: linear-gradient(to right, #f1f1f1, #fcfcfc 0.6em);
        }
        .account-tabs-handles .MuiTab-root {
          min-width: 0;
          padding: 2em 0.8em;
          margin-bottom: 0.5em;
          background: linear-gradient(to right, #dfdfdf, #f3f3f3 0.4em);
          box-shadow: inset -1px 0px 1px #00000059;
        }
        .account-tabs-handles .MuiTabs-indicator {
          background-color: black;
        }
        .account-tabs-handles .MuiTab-root.Mui-selected {
          background: linear-gradient(to right, #e8e5e5, #dadada 0.4em);
          color: black;
        }
        .account-tabs-handles .MuiTab-root.tab-blocked-by {
          background: linear-gradient(to right, #f7c9c1, #fde4e0 0.4em);
        }
        .account-tabs-handles .MuiTab-root.tab-blocked-by.Mui-selected {
          background: linear-gradient(to right, #ffccc4, #f4b6ac 0.6em);
          color: #a02d19;
        }
        .account-tabs-handles.selected-tab-blocked-by .MuiTabs-indicator {
          background-color: #a02d19;
        }

        .account-tabs-handles .MuiTab-root.tab-blocking {
          background: linear-gradient(to right, #efe5b2, #fff7d1 0.6em);
        }
        .account-tabs-handles .MuiTab-root.tab-blocking.Mui-selected {
          background: linear-gradient(to right, #fff2af, #ffea81 0.6em);
          color: #a26900;
        }
        .account-tabs-handles.selected-tab-blocking .MuiTabs-indicator {
          background-color: #b87700;
        }

        .account-tabs-handles .MuiTab-root.tab-followers {
          background: linear-gradient(to right, #c5d7f9, #e9f1ff 0.6em);
        }
        .account-tabs-handles .MuiTab-root.tab-followers.Mui-selected {
          background: linear-gradient(to right, #c1d7ff, #a3c1f7 0.6em);
          color: #27519b;
        }
        .account-tabs-handles.selected-tab-followers .MuiTabs-indicator {
          background-color: #3c68b7;
        }

        .account-tabs-content {
          grid-row: 1 / 3;
          grid-column: 2 / 3;

          position: relative;

          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: 1fr;
        }

        .account-tabs-content .account-tab {
          grid-row: 1 / 2;
          grid-column: 1 / 2;

          opacity: 0;
          pointer-events: none;
          disabled: true;
          position: relative;

          transition: opacity 0.1s ease-in-out;

          overflow: auto;
        }

        .account-tabs-content .account-tab-selected {
          z-index: 10;
          opacity: 1;
          pointer-events: auto;
          disabled: false;
        }

        @media (max-width: 800px) {
          .layout {
            position: relative;
            left: 0; top: 0;
            width: 100%; min-height: 100%;

            grid-template-columns: 1fr auto;
            grid-template-rows: auto 1fr;
          }

          .account-header {
            grid-column: 1 / 3;
            grid-row: 1 / 2;

            position: sticky;
            top: -7em;
            z-index: 20;
            background: white;
          }

          .account-tabs-content {
            grid-column: 1 / 2;
            grid-row: 2 / 3;
          }

          .account-tabs-handles {
            grid-column: 2 / 3;
            grid-row: 2 / 3;

            border-top: solid 1px #edecec;
          }

          .account-tabs-content .account-tab {
            overflow: unset;
          }
        }
      ` }}>
        </style>
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
                  this.materializedTabs[tab] = renderTabContent(tab, this.props.account);

                const tabContent = this.materializedTabs[tab];
                if (!tabContent) return undefined;

                return (
                  <div key={tab} className={
                    'account-tab ' + (tab === selectedTab ? 'account-tab-selected' : '')}>
                    {tabContent}
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

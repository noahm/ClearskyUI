// @ts-check
/// <reference path="../../types.d.ts" />

import React, { Component } from 'react';
import { isPromise, postHistory } from '../../api';
import { HistoryLoading } from './history-loading';
import { HistoryScrollableList } from './history-scrollable-list';
import { SearchHeader } from './search-header';
import { useSearchParams } from 'react-router-dom';

/**
 * @extends {Component<
 *  { account: AccountInfo },
 *  { searchText: string, searchTextInstant: string, error: Error | null, loaded?: number }>}
 */
export class HistoryPanel extends Component {

  /**
   * @type {ReturnType<typeof postHistory> & { shortHandle?: string, shortDID?: string } | Awaited<ReturnType<typeof postHistory>> | undefined}
   */
  accountPostHistory

  render() {

    if (this.accountPostHistory) {
      if (!this.isRelevant(this.accountPostHistory))
        this.accountPostHistory = undefined;
    }

    if (!this.accountPostHistory) {
      this.accountPostHistory = postHistory(this.props.account.shortHandle || this.props.account.shortDID);
      if (!this.accountPostHistory.shortHandle && !this.accountPostHistory.shortDID) {
        this.accountPostHistory.shortHandle = this.props.account.shortHandle;
        this.accountPostHistory.shortDID = this.props.account.shortDID;
      }
      (async () => {
        try {
          const postHistory = await this.accountPostHistory;
          if (!this.isRelevant(postHistory)) return;

          this.accountPostHistory = postHistory;
          this.setState({ error: null, loaded: Date.now() })

          await this.accountPostHistory?.fetchMore();
          if (!this.isRelevant(postHistory)) return;

          this.setState({ error: null, loaded: Date.now() })
        } catch (err) {
          this.setState({ error: err, loaded: Date.now() });
        }
      })();
    }

    return (
      <SearchParamsHelper>
        {({ searchParams, setSearchParams }) => {
          const searchText =
            typeof this.state?.searchText === 'string' ? this.state.searchText :
              searchParams.get('q') || '';
          const searchTextInstant =
            typeof this.state?.searchTextInstant === 'string' ? this.state.searchTextInstant :
              searchText;

          return (
            <>
              <SearchHeader value={searchTextInstant}
                onChange={(event) => {
                  const searchTextInstant = event.target.value;
                  this.setState({ searchTextInstant });
                  clearTimeout(this.applySearchTextTimeout);
                  this.applySearchTextTimeout = setTimeout(() => {
                    if (this.state?.searchText !== searchTextInstant) {
                      this.setState({ searchText: searchTextInstant });
                      setSearchParams(searchTextInstant ? { q: searchTextInstant } : {});
                    }
                  }, 500);
                }} />
              <div style={{
                // background: 'tomato',
                // backgroundColor: '#fffcf5',
                // backgroundImage: 'linear-gradient(to bottom, white, transparent 2em)',
                minHeight: '100%'
              }}>
                {
                  isPromise(this.accountPostHistory) ?
                    <HistoryLoading account={this.props.account} /> :

                    <HistoryScrollableList account={this.props.account} history={this.accountPostHistory} searchText={searchText} />
                }

              </div>
            </>
          );
        }}
      </SearchParamsHelper>
    );
  }

  /** @param {{ shortDID?: string, shortHandle?: string } | undefined} account */
  isRelevant(account) {
    return account && (
      account.shortDID === this.props.account.shortDID ||
      account.shortHandle === this.props.account.shortHandle
    );
  }

}

function SearchParamsHelper({ children }) {
  const [searchParams, setSearchParams] = useSearchParams();
  return children({ searchParams, setSearchParams });
}
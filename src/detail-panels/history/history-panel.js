// @ts-check

import React, { Component } from 'react';
import { isPromise, postHistory } from '../../api';
import { HistoryLoading } from './history-loading';
import { HistoryScrollableList } from './history-scrollable-list';
import { SearchHeader } from './search-header';
import { useSearchParams } from 'react-router-dom';

export class HistoryPanel extends Component {

  /**
   * @type {ReturnType<typeof postHistory> & { handle?: string, did?: string } | Awaited<ReturnType<typeof postHistory>> | undefined}
   */
  accountPostHistory

  render() {

    if (this.accountPostHistory) {
      if (!this.isRelevant(this.accountPostHistory))
        this.accountPostHistory = undefined;
    }

    if (!this.accountPostHistory) {
      this.accountPostHistory = postHistory(this.props.account.handle || this.props.account.did);
      if (!this.accountPostHistory.handle && !this.accountPostHistory.did) {
        this.accountPostHistory.handle = this.props.account.handle;
        this.accountPostHistory.did = this.props.account.did;
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

  isRelevant(account) {
    return account && (
      account.did === this.props.account.did ||
      account.handle === this.props.account.handle
    );
  }

}

function SearchParamsHelper({ children }) {
  const [searchParams, setSearchParams] = useSearchParams();
  return children({ searchParams, setSearchParams });
}
// @ts-check
// <reference path="../api.d.ts" />
import React from 'react';

import { Autocomplete, TextField } from '@mui/material';
import { Component } from 'react';
import { isPromise, resolveHandleOrDID, searchHandle, unwrapShortDID, unwrapShortHandle } from '../api';

/**
 * @param {{
 *  className?: string,
 *  searchText?: string,
 *  onSearchTextChanged?: (text: string) => void,
 *  onAccountSelected?: (account: AccountInfo | SearchMatch) => void,
 *  onResolveAccount?: (text: string) => Promise<AccountInfo[]>
 * }} _
 */
export class SearchAutoComplete extends Component {

  render() {
    const { className, searchText, onAccountSelected } = this.props;
    if (!this.renderedBefore) {
      this.renderedBefore = true;
      if (searchText) this.debouncedTextChange(searchText);
    }

    return (
      <Autocomplete
        freeSolo
        className={className}
        options={this.state?.options || []}
        value={searchText || ''}
        filterOptions={options => options}
        onChange={(event, newValue) => {
          if (typeof onAccountSelected === 'function') {
            if (newValue?.account)
              onAccountSelected(newValue?.account);
            else if (newValue?.shortDID)
              onAccountSelected(newValue?.account);
          }
        }}
        getOptionLabel={option => {
          return option.label || option || '';
        }}
        renderOption={(params, option) => option.render(params, option)}
        renderInput={(params) =>
          <TextField
            {...params}
            onChange={event => this.handleTextChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && this.state?.options?.[0].account && typeof onAccountSelected === 'function') {
                event.preventDefault();
                event.stopPropagation();
                onAccountSelected(this.state?.options?.[0].account);
              }
            }}
            label="Find an account:"
            variant="standard" />}
      />
    );
  }

  handleTextChange = (newValue) => {
    clearTimeout(this.resolveTimeout);
    if (newValue) this.resolveTimeout = setTimeout(
      this.debouncedTextChange, 500,
      newValue);

    const { onSearchTextChanged } = this.props;

    if (typeof onSearchTextChanged === 'function') {
      onSearchTextChanged(newValue || '');
    }

    this.setState({
      options: !newValue ? [] : [{
        label: newValue,
        render: (props) => <Resolving key='resolving' />
      }]
    });
  };

  debouncedTextChange = async (newValue) => {
    if (this.props.searchText !== newValue) return;

    try {
      const searchResults = await searchHandle(newValue);

      if (this.props.searchText !== newValue) return;

      this.setState({
        options: searchResults.map(entry => {
          const accountOrPromise = resolveHandleOrDID(entry.shortDID);
          const option = {
            label: entry.shortHandle,
            account: isPromise(accountOrPromise) ? entry : accountOrPromise,
            render: (props) => <SearchEntryDisplay key={entry.shortDID} entry={entry} />
          };
          return option;
        })
      });
    } catch (err) {
      console.log('reslving did/handle ', err);
      this.setState({
        options: [{
          label: newValue, render:
            (props) => <ResolveFailure key='failure' error={err} />
        }]
      });
    }
  };
}

class SearchEntryDisplay extends React.Component {
  /** @type {string} */
  shortDID;

  /** @type {Promise | undefined} */
  promise;

  /** @type {AccountInfo | undefined} */
  account;

  /** @type {Error | undefined} */
  error;

  render() {
    if (this.shortDID !== this.props.entry.shortDID) {
      this.shortDID = this.props.entry.shortDID;
      const accountOrPromise = resolveHandleOrDID(this.shortDID);

      if (isPromise(accountOrPromise)) {
        this.promise = accountOrPromise;
        this.account = undefined;
        this.error = undefined;
        accountOrPromise.then(
          account => {
            this.promise = undefined;
            this.account = account;
            this.error = undefined;
            this.setState(account);
          },
          error => {
            this.promise = undefined;
            this.account = undefined;
            this.error = error;
            this.setState(error);
          });
      } else {
        this.promise = undefined;
        this.account = accountOrPromise;
        this.error = undefined;
      }
    }

    if (this.error) {
      return <ResolveFailure entry={this.props.entry} error={this.error} />;
    } else if (this.account) {
      return <ResolveSuccess entry={this.props.entry} account={this.account} />;
    } else {
      return <ResolvingMatch entry={this.props.entry} />;
    }
  }
}

function Resolving({ }) {
  return (
    <li className="resolving-item">
      <span className='at-sign'>@</span>
      <span className='resolving-handle'>Resolving...</span>
    </li>
  );
}

/**
 * @param {{ entry: SearchMatch }} _
 */
function ResolvingMatch({ entry }) {
  return (
    <li className="resolving-item">
      <span className='at-sign'>@</span>
      <span className='resolved-handle'>
        <FullHandle shortHandle={entry.shortHandle} />
      </span>

      <span
        className='resolved-did'
        style={{
          display: 'inline-block',
          float: 'right',
          fontSize: '80%',
          marginLeft: '2em',
          opacity: '0.7'
        }}>
        <FullDID shortDID={entry.shortDID} />
      </span>
    </li>
  );
}

/** @param {{ entry?: SearchMatch, error: Error }} */
function ResolveFailure({ entry, error }) {
  return (
    <li className="resolve-failure-item">
      {error?.constructor?.name ? <span className='error-constructor-name'>{error.constructor.name}</span> : undefined}
      {error?.message ? <span className='error-message'>{error.message}</span> : undefined}
      {error?.stack && error.stack !== error.message ?
        <span className='error-stack'>{error.stack.replace(error.message || '', '')}</span> : undefined}
    </li>
  );
}

/** @param {{ entry?: SearchMatch, account: AccountInfo }} */
function ResolveSuccess({ entry, account }) {
  return (
    <li className="resolve-success-item">
      {
        <img src={account.avatarUrl} className='resolved-avatar'
          style={{
            width: '2em', height: '2em',
            borderRadius: '200%',
            marginRight: '0.5em'
          }} />
      }
      <span className='resolved-handle'>
        <FullHandle shortHandle={account.shortHandle} />
      </span>

      <span
        className='resolved-did'
        style={{
          display: 'inline-block',
          float: 'right',
          fontSize: '80%',
          marginLeft: '2em',
          opacity: '0.7'
        }}>
        <FullDID shortDID={account.shortDID} />
      </span>
    </li>
  );
}

/** @param {{ shortHandle: string }} _ */
function FullHandle({ shortHandle }) {
  const fullHandle = unwrapShortHandle(shortHandle);
  if (shortHandle === fullHandle) return shortHandle;
  else return (<>
    {shortHandle}
    <span className='handle-std-suffix'>{fullHandle.slice(shortHandle.length)}</span>
  </>);
}

/** @param {{ shortDID: string }} _ */
function FullDID({ shortDID }) {
  const fullDID = unwrapShortDID(shortDID);
  if (shortDID === fullDID) return fullDID;
  else return (<>
    <span className='did-std-prefix'>{fullDID.slice(0, -shortDID.length)}</span>
    {shortDID}
  </>);
}

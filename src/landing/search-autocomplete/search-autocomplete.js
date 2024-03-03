// @ts-check
// <reference path="../api.d.ts" />

import React, { Component } from 'react';

import { Autocomplete, TextField } from '@mui/material';

import { isPromise, resolveHandleOrDID, searchHandle } from '../../api';
import { Visible } from '../../common-components/visible';
import { SearchEntryDisplay } from './search-entry-display';

import './search-autocomplete.css';
import { localise } from '../../localisation';

const AUTOCOMPLETE_POPULATE_BATCH = 20;

/**
 * @extends {React.Component<{
 *  className?: string,
 *  searchText?: string,
 *  onSearchTextChanged?: (text: string) => void,
 *  onAccountSelected?: (account: Partial<AccountInfo & SearchMatch>) => void,
 *  onResolveAccount?: (text: string) => Promise<AccountInfo[]>
 * }, { 
 *  max: number,
 *  options: {
 *    label: string,
 *    render: (props, option) => React.ReactNode,
 *    account?: Partial<AccountInfo & SearchMatch>,
 *    postID?: string
 * }[] }>}
 */
export class SearchAutoComplete extends Component {

  highlight;

  render() {
    const { className, searchText, onAccountSelected } = this.props;
    if (!this.renderedBefore) {
      this.renderedBefore = true;
      if (searchText) this.debouncedTextChange(searchText);
    }

    const showMax = this.state?.max || 20;

    const first20Options = this.state?.options?.slice(0, showMax) || [];
    if (first20Options.length < this.state?.options?.length) {
      first20Options.push({
        label: '...',
        render: (props) => (
          <li {...props} className='search-entry more-results-item'>
            <Visible
              onVisible={() => {
                this.setState({
                  max: showMax + AUTOCOMPLETE_POPULATE_BATCH
                });
              }}>
              ...
            </Visible>
          </li>
        )
      });
    }

    if (searchText !== this.highlight?.searchText)
      this.highlight = undefined;

    return (
      <Autocomplete
        freeSolo
        className={'search-autocomplete ' + (className || '')}
        options={first20Options}
        value={searchText || ''}
        filterOptions={options => options}
        onChange={(event, newValue) => {
          if (typeof newValue !== 'string' && newValue?.account && typeof onAccountSelected === 'function') {
            if (newValue?.account)
              onAccountSelected(
                newValue.postID ? { ...newValue.account, postID: newValue.postID } :
                  newValue.account);
          }
        }}
        onHighlightChange={(event, newValue) => {
          this.highlight = {
            searchText: this.props.searchText,
            value: newValue
          };
        }}
        getOptionLabel={option => {
          if (typeof option === 'string') return option;
          return option.label || String(option) || '';
        }}
        renderOption={(params, option) =>
          [first20Options] &&
          option.render(params, option)}
        renderInput={(params) =>
          <TextField
            {...params}
            onChange={event => this.handleTextChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && this.state?.options?.[0].account && typeof onAccountSelected === 'function') {
                event.preventDefault();
                event.stopPropagation();
                const account =
                  this.props.searchText &&
                  this.highlight?.searchText === this.props.searchText &&
                  this.highlight?.value?.account ||
                  this.state?.options?.[0].account;

                if (account)
                  onAccountSelected(account);
              }
            }}
            label={localise('Find an account:', { uk: 'Кого шукаємо?' })}
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
        render: (props) => <Resolving {...props} key='resolving' />
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
            postID: entry.postID,
            render: (props) => <SearchEntryDisplay {...props} key={entry.shortDID} entry={entry} />
          };
          return option;
        })
      });
    } catch (err) {
      console.log('reslving did/handle ', err);
      this.setState({
        options: [{
          label: newValue, render:
            (props) => <ResolvingFailure {...props} key='failure' error={err} />
        }]
      });
    }
  };
}

function Resolving({ ...rest }) {
  return (
    <li {...rest} className="resolving-item">
      <span className='at-sign'>@</span>
      <span className='resolving-handle'>{localise('Resolving...', { uk: 'Пошук...' })}</span>
    </li>
  );
}

  /** @param {{ entry: SearchMatch, error: Error }} _ */
function ResolvingFailure({ error, ...rest }) {
  return (
    <div className='resolve-failure-item'>
      <>
        {error?.constructor?.name ? <span className='error-constructor-name'>{error.constructor.name}</span> : undefined}
        {error?.message ? <span className='error-message'>{error.message}</span> : undefined}
        {error?.stack && error.stack !== error.message ?
          <span className='error-stack'>{error.stack.replace(error.message || '', '')}</span> : undefined}
      </>
    </div>
  );
}


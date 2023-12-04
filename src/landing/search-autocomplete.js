// @ts-check
// <reference path="../api.d.ts" />
import React from 'react';

import { Autocomplete, TextField } from '@mui/material';
import { Component } from 'react';
import { resolveHandleOrDID } from '../api';

/**
 * @param {{
 *  className?: string,
 *  searchText?: string,
 *  onSearchTextChanged?: (text: string) => void,
 *  onAccountSelected?: (account: string) => void,
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
          if (newValue?.account && typeof onAccountSelected === 'function') {
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
        render: (props) => <Resolving key='resolving' liProps={props} />
      }]
    });
  };

  debouncedTextChange = async (newValue) => {
    if (this.props.searchText !== newValue) return;

    try {

      const resolvedAccount = await resolveHandleOrDID(newValue);

      if (this.props.searchText !== newValue) return;

      this.setState({
        options: [{
          label: resolvedAccount.handle,
          account: resolvedAccount,
          render: (props) => <ResolveSuccess key='success' liProps={props} accountInfo={resolvedAccount} />
        }]
      });
    } catch (err) {
      console.log('reslving did/handle ', err);
      this.setState({
        options: [{
          label: newValue, render:
            (props) => <ResolveFailure key='failure' liProps={props} error={err} />
        }]
      });
    }
  };
}

function Resolving({ liProps }) {
  return <li {...liProps}>Resolving...</li>;
}

function ResolveFailure({ liProps, error }) {
  return (
    <li {...liProps} className={(liProps?.className || '') + ' resolve-failure-item'}>
      {error?.constructor?.name ? <span className='error-constructor-name'>{error.constructor.name}</span> : undefined}
      {error?.message ? <span className='error-message'>{error.messge}</span> : undefined}
      {error?.stack && error.stack !== error.message ?
        <span className='error-stack'>{error.stack.replace(error.message || '', '')}</span> : undefined}
    </li>
  );
}

function ResolveSuccess({ liProps, accountInfo }) {
  return (
    <li {...liProps} className={(liProps?.className || '') + ' resolve-success-item'}>
      {
        <img src={accountInfo.avatarUrl} className='resolved-avatar'
          style={{
            width: '2em', height: '2em',
            borderRadius: '200%',
            marginRight: '0.5em'
          }} />
      }
      <span className='resolved-handle'>{accountInfo.handle}</span>

      <span
        className='resolved-did'
        style={{
          display: 'inline-block',
          float: 'right',
          fontSize: '80%',
          marginLeft: '2em',
          opacity: '0.7'
        }}>
        {accountInfo.did}
      </span>
    </li>
  );
}

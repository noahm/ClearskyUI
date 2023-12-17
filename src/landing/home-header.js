// @ts-check
/// <refererence path="./types.d.ts" />

import React from 'react';

import { SearchAutoComplete } from './search-autocomplete';

/**
 * @param {{
 *  className?: string,
 *  searchText?: string,
 *  onSearchTextChanged?: (text: string) => void,
 *  onAccountSelected?: (account: AccountInfo | SearchMatch) => void
 * }} _
 */
export function HomeHeader({ className, searchText, onSearchTextChanged, onAccountSelected }) {
  return (
    <div className={className} style={{ padding: '0 1em' }}>
      <h1 style={{ textAlign: 'center' }}>ClearSky</h1>
      <SearchAutoComplete
        searchText={searchText}
        onSearchTextChanged={onSearchTextChanged}
        onAccountSelected={onAccountSelected}
      />
    </div>
  );
}

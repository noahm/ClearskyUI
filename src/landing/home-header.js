// @ts-check
/// <refererence path="./types.d.ts" />

import React from 'react';
import logoDay from '../../static/CleardayLarge.png';
import logoNight from '../../static/ClearnightLarge.png';
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
  const currentTime = new Date();
  const hours = currentTime.getHours();

  // Determine if it's day or night based on hours
  const isDay = hours >= 6 && hours < 18;

  // Use the appropriate logo image
  const logoSrc = isDay ? logoDay : logoNight;

  return (
    <div className={className} style={{ padding: '0 1em' }}>
      <img src={logoSrc} alt="ClearSky Logo" style={{ width: '700px', height: 'auto' }} />
      <SearchAutoComplete
        searchText={searchText}
        onSearchTextChanged={onSearchTextChanged}
        onAccountSelected={onAccountSelected}
      />
    </div>
  );
}

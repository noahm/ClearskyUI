// @ts-check
/// <refererence path="./types.d.ts" />

import React, { useState, useEffect } from 'react';
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
  const [logoSrc, setLogoSrc] = useState(getLogo());

  useEffect(() => {
    // Update the logo every minute
    const intervalId = setInterval(() => {
      setLogoSrc(getLogo());
    }, 60000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, []);

  function getLogo() {
    const currentTime = new Date();
    const hours = currentTime.getHours();

    return hours >= 6 && hours < 18 ? logoDay : logoNight;
  }

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

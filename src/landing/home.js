// @ts-check
import React from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { unwrapShortHandle } from '../api';
import { HomeHeader } from './home-header';
import { HomeStats } from './home-stats';

import './home.css';
import { Logo } from './logo';

export function Home() {

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = React.useState(searchParams.get('q') || '');
  const navigate = useNavigate();

  return (
    <div className="layout">
      <Logo />
      <HomeHeader className='home-header'
        searchText={searchText}
        onSearchTextChanged={searchText => {
          setSearchText(searchText);
          setSearchParams({ q: searchText });
        }}
        onAccountSelected={(account) => {
          console.log('Account selected ', account);
          navigate('/' + unwrapShortHandle(account.shortHandle));
        }}
      />
      <HomeStats className='home-stats' />
    </div>
  );
}

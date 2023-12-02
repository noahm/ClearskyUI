// @ts-check
import React from 'react';

import { HomeHeader } from './home-header';
import { HomeStats } from './home-stats';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function Home() {

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = React.useState(searchParams.get('q') || '');
  const navigate = useNavigate();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .layout {
          position: fixed;
          left: 0; top: 0;
          width: 100%; height: 100%;

          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
        }

        .home-header {
          grid-column: 1 / 2;
          grid-row: 1 / 2;
          align-self: end;
        }

        .home-stats {
          grid-column: 2 / 3;
          grid-row: 1 / 3;
          align-self: center;
        }

        @media (max-width: 800px) {
          .layout {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
          }

          .home-header {
            grid-column: 1 / 2;
            grid-row: 1 / 2;
          }

          .home-stats {
            grid-column: 1 / 2;
            grid-row: 2 / 3;
          }

        }
      ` }}>        
      </style>
      <div className="layout">
        <HomeHeader className='home-header'
          searchText={searchText}
          onSearchTextChanged={searchText => {
            setSearchText(searchText);
            setSearchParams({ q: searchText });
          }}
          onAccountSelected={(account) => {
            console.log('Account selected ', account);
            navigate('/' + account.handle);
          }}
        />
        <HomeStats className='home-stats' />
      </div>
    </>
  );
}

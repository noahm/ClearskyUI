// @ts-check

import React from 'react';

import { Button, Fab } from '@mui/material';

import './about.css';
import { AccountShortEntry } from '../../common-components/account-short-entry';

export function About({ onToggleAbout }) {
  return (
    <div className="about">
      <span className='corner-buttons'>
        <Button className='about-button' onClick={onToggleAbout}>
          <span className='about-button-icon'>
            i
          </span>
        </Button>
      </span>
      <div className='text'>
        Version: 0.2.3 <br />
        Created by: <AccountShortEntry
          account='thieflord.dev'
          link='https://bsky.app/profile/thieflord.dev'
          accountTooltipPanel={true}
        /> <br />
        Implementation developer: <AccountShortEntry
          account='oyin.bo'
          link='https://bsky.app/profile/oyin.bo'
          accountTooltipPanel='User experience and interaction beauty.'
        />
      </div>
    </div>
  );
}
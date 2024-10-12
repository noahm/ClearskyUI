// @ts-check

import React from 'react';

import { Button } from '@mui/material';

import { AccountShortEntry } from '../../common-components/account-short-entry';
import { localise } from '../../localisation';
import { version } from '../../../package.json';

import './about.css';

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
        <span className='legalese'>
          <a href="/privacy-policy.html">Privacy Policy</a> | <a
            href="/terms-and-conditions.html">Terms and Conditions </a>
          | <a href="mailto:support@clearsky.app">Contact Us</a> | <a href="https://ko-fi.com/thieflord">Donate</a> | <a
            href="#" className="termly-display-preferences">Consent Preferences</a> | <a href="/cookie-policy.html">Cookie Policy</a>
        </span>

          {localise('Version', {uk: 'Версія'})}: {version} <br/>
          &nbsp; {localise('Created by', { uk: 'Створив' })}: <AccountShortEntry
          account='thieflord.dev'
          link='https://bsky.app/profile/thieflord.dev'
          accountTooltipPanel={true}
        />
      </div>
    </div>
  );
}
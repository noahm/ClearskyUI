// @ts-check

import React, { useState, useEffect } from 'react';

import { Button } from '@mui/material';

import { AccountShortEntry } from '../../common-components/account-short-entry';

import { localise } from '../../localisation';
import './about.css';

export function About({ onToggleAbout }) {
  const [version, setVersion] = useState(null);

  useEffect(() => {
    // Fetch the version from your backend
    fetch('/api/v1/base/internal/status/process-status')
      .then(response => response.json())
      .then(data => {
        const clearskyUIVersion = data["clearsky UI version"];
        setVersion(clearskyUIVersion);
      })
      .catch(error => {
        console.error('Error fetching version:', error);
      });
  }, []);

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
        {localise('Version', { uk: 'Версія' })}: {version} <br />
        {localise('Created by', { uk: 'Створив' })}: <AccountShortEntry
          account='thieflord.dev'
          link='https://bsky.app/profile/thieflord.dev'
          accountTooltipPanel={true}
        /> <br />
        {localise('Implementation developer', { uk: 'Програміст-артист' })}: <AccountShortEntry
          account='oyin.bo'
          link='https://bsky.app/profile/oyin.bo'
          accountTooltipPanel={localise('User experience and interaction beauty.', {uk: 'Майстер намалювати та втілити.'})}
        />
      </div>
    </div>
  );
}
// @ts-check

import React from 'react';

import { Button, Fab } from '@mui/material';

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
        conceived by ******<br />
        implemented with help from ***, ****, *** - version 0.2.0
      </div>
    </div>
  );
}
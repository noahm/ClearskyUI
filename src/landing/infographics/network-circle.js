// @ts-check

/// <reference path="../../types.d.ts" />

import React from 'react';

import { FaceIcon } from './face-icon';

import './network-circle.css';

/**
 * @param {{
 *  activeAccounts?: number,
 *  deletedAccounts?: number
 * }} _
 */
export function NetworkCircle({ activeAccounts = 2184714, deletedAccounts = 21034 }) {
  return (
    <div className='network-circle'>
      <div className='network-circle-circle'>
        <div className='network-crowd network-active-crowd'>
          <div className='network-crowd-active-count-container'>
            <div className='network-crowd-active-count'>{activeAccounts.toLocaleString()}</div>
            <div className='network-crowd-active-label'>active accounts</div>
          </div>
          {/* 9 faces */}
          <FaceIcon className='crowd-icon' />
          <FaceIcon className='crowd-icon' />
          <FaceIcon className='crowd-icon' />
          <br />
          <FaceIcon className='crowd-icon' />
          <FaceIcon className='crowd-icon' />
          <FaceIcon className='crowd-icon' />
          <FaceIcon className='crowd-icon' />
          <br />
          <FaceIcon className='crowd-icon' />
          <FaceIcon className='crowd-icon' />
        </div>
        <div className='network-crowd network-deleted-crowd'>
          <div className='network-crowd-deleted-count-container'>
            <div className='network-crowd-deleted-count'>{deletedAccounts.toLocaleString()}</div>
            <div className='network-crowd-deleted-label'>deleted</div>
          </div>

          <FaceIcon removed className='crowd-icon crowd-icon-deleted' />
        </div>
      </div>
    </div>
  );
}
// @ts-check

import React from 'react';

import { Tab, Tabs } from '@mui/material';

import { accountTabs } from './layout';

import './tab-selector.css';

export function TabSelector({ className, tab, onTabSelected }) {

  const tabHandlers = {
    'blocked-by': <VerticalTab key='blocked-by' className='tab-blocked-by'>Blocked By</VerticalTab>,
    'blocking': <VerticalTab key='blocking' className='tab-blocking'>Blocking</VerticalTab>,
    'lists': <VerticalTab key='lists' className='tab-lists'>Lists</VerticalTab>,
    'history': <VerticalTab key='history' className='tab-history'>History</VerticalTab>
  };

  return (
    <div className={'tab-outer-container ' + (className || '')}>
      <Tabs
        className={'tab-selector-root selected-tab-' + tab}
        orientation="vertical"
        value={accountTabs.indexOf(tab)}
        onChange={
          typeof onTabSelected !== 'function' ? undefined :
            (event, newValue) => onTabSelected(accountTabs[newValue])
        }
      >
        {accountTabs.map(tabKey => tabHandlers[tabKey])}
      </Tabs>

      <div className='bluethernal-llc-watermark'>
        Bluethernal LLC
      </div>
    </div>
  );
}

function VerticalTab({ children, ...rest }) {
  return (
    <Tab
      label={
        <div style={{ writingMode: 'vertical-rl' }}>
          {children}
        </div>
      }
      {...rest} />
  );
}

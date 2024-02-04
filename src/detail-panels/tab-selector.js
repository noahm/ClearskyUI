// @ts-check
import { Tab, Tabs } from '@mui/material';
import React from 'react';
import { accountTabs } from './layout';

export function TabSelector({ className, tab, onTabSelected }) {

  const tabHandlers = {
    'blocked-by': <VerticalTab key='blocked-by' className='tab-blocked-by'>Blocked By</VerticalTab>,
    'blocking': <VerticalTab key='blocking' className='tab-blocking'>Blocking</VerticalTab>,
    'lists': <VerticalTab key='lists' className='tab-lists'>Lists</VerticalTab>,
    'history': <VerticalTab key='history' className='tab-history'>History</VerticalTab>
  };

  return (
    <div className={'tab-outer-container ' + (className || '')}>
      <style dangerouslySetInnerHTML={{
        __html: `
.tab-outer-container {
}

.tab-selector-root {

  position: sticky;
  top: 5em;

  padding-right: 1em;
  padding-top: 0.5em;

  border-right: none;
}

.tab-selector-root .MuiTab-root {
  min-width: 0;
  padding: 2em 0.8em;
  margin-bottom: 0.5em;
  background: linear-gradient(to right, #dfdfdf, #f3f3f3 0.4em);
  box-shadow: inset -1px 0px 1px #00000059;
}
.tab-selector-root .MuiTabs-indicator {
  background-color: black;
}
.tab-selector-root .MuiTab-root.Mui-selected {
  background: linear-gradient(to right, #e8e5e5, #dadada 0.4em);
  color: black;
}
.tab-selector-root .MuiTab-root.tab-blocked-by {
  background: linear-gradient(to right, #f7c9c1, #fde4e0 0.4em);
}
.tab-selector-root .MuiTab-root.tab-blocked-by.Mui-selected {
  background: linear-gradient(to right, #ffccc4, #f4b6ac 0.6em);
  color: #a02d19;
}
.tab-selector-root.selected-tab-blocked-by .MuiTabs-indicator {
  background-color: #a02d19;
}

.tab-selector-root .MuiTab-root.tab-blocking {
  background: linear-gradient(to right, #efe5b2, #fff7d1 0.6em);
}
.tab-selector-root .MuiTab-root.tab-blocking.Mui-selected {
  background: linear-gradient(to right, #fff2af, #ffea81 0.6em);
  color: #a26900;
}
.tab-selector-root.selected-tab-blocking .MuiTabs-indicator {
  background-color: #b87700;
}

.tab-selector-root .MuiTab-root.tab-lists {
  background: linear-gradient(to right, #c5d7f9, #e9f1ff 0.6em);
}
.tab-selector-root .MuiTab-root.tab-lists.Mui-selected {
  background: linear-gradient(to right, #c1d7ff, #a3c1f7 0.6em);
  color: #27519b;
}
.tab-selector-root.selected-tab-lists .MuiTabs-indicator {
  background-color: #3c68b7;
}

      ` }}>
      </style>
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

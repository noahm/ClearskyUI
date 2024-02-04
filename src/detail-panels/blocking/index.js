// @ts-check

import React from 'react';

import { blocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';

export function BlockingPanel({ account }) {
  return (
    <BlockPanelGeneric
      className='blocking-panel'
      fetch={blocklist}
      account={account}
      header={({ count }) => <>Blocking <span>{count.toLocaleString()}:</span></>} />
  );
}
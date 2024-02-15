// @ts-check

import React from 'react';

import { blocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';

export function BlockingPanel({ account }) {
  return (
    <BlockPanelGeneric
      className='blocking-panel'
      fetch={blocklist}
      account={account}
      header={({ count }) => <>{localise('Blocking', { uk: 'Блокує' })} <span>{count.toLocaleString()}:</span></>} />
  );
}
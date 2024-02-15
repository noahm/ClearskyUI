// @ts-check

import React from 'react';

import { singleBlocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';

export function BlockedByPanel({ account }) {
  return (
    <BlockPanelGeneric
      className='blocked-by-panel'
      fetch={singleBlocklist}
      account={account}
      header={({ count }) => <>{localise('Blocked by', { uk: 'Блокують' })} <span>{count.toLocaleString()}:</span></>} />
  );
}

// @ts-check

import React from 'react';

import { singleBlocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';

export function BlockedByPanel({ account }) {
  return (
    <BlockPanelGeneric
      className='blocked-by-panel'
      fetch={singleBlocklist}
      account={account}
      header={({ count }) => 'Blocked by ' + count.toLocaleString() + ':'} />
  );
}

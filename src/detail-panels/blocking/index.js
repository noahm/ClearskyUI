// @ts-check

import { useBlocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';

export function BlockingPanel({ account }) {
  return (
    <BlockPanelGeneric
      className='blocking-panel'
      useBlocklistQuery={useBlocklist}
      account={account}
      header={({ count }) => <>{localise('Blocking', { uk: 'Блокує' })} <span>{count.toLocaleString()}:</span></>} />
  );
}

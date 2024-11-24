// @ts-check

import { useSingleBlocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';

export function BlockedByPanel({ account }) {
  return (
    <BlockPanelGeneric
      className='blocked-by-panel'
      useBlocklistQuery={useSingleBlocklist}
      account={account}
      header={({ count }) => <>{localise('Blocked by', { uk: 'Блокують' })} <span>{count.toLocaleString()}:</span></>} />
  );
}

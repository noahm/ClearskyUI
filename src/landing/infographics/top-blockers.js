// @ts-check

/// <reference path="../../types.d.ts" />

import React, { useState } from 'react';
import { TopList } from './top-list';

/**
 * @param {{
 *  blockers: DashboardBlockListEntry[] | undefined,
 *  limit?: number
 * }} _
 */
export function TopBlockers({ blockers, limit }) {
  return (
    <TopList
      className='top-blocked'
      header={(list) => <>Top {list.length || undefined} Blockers</>}
      list={blockers}
      limit={limit} />
  );
}
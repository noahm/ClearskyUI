// @ts-check

/// <reference path="../../types.d.ts" />

import React, { useState } from 'react';
import { TopList } from './top-list';

/**
 * @param {{
 *  blocked: DashboardBlockListEntry[] | undefined,
 *  limit?: number
 * }} _
 */
export function TopBlocked({ blocked, limit }) {
  return (
    <TopList
      className='top-blocked'
      header={(list) => <>Top {list.length || undefined} Blocked</>}
      list={blocked}
      limit={limit} />
  );
}
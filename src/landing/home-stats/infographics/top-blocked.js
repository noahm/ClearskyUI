// @ts-check

/// <reference path="../../../types.d.ts" />

import React, { useState } from 'react';
import { TopList } from './top-list';

/**
 * @param {{
 *  blocked: DashboardBlockListEntry[] | undefined,
 *  blocked24: DashboardBlockListEntry[] | undefined,
 *  limit?: number
 * }} _
 */
export function TopBlocked({ blocked, blocked24, limit }) {
  return (
    <TopList
      className='top-blocked'
      header={(list) => <>Top {list.length || undefined} Blocked</>}
      list={blocked}
      list24={blocked24}
      limit={limit} />
  );
}
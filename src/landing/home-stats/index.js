// @ts-check

import React, { useState } from 'react';

import { HomeStatsMain } from './home-stats-main';
import { dashboardStats, isPromise } from '../../api';
import { forAwait } from '../../common-components/for-await';
import { parseNumberWithCommas } from '../../api/core';
import { HomeStatsTable } from './home-stats-table';

/**
 * @typedef {{
 *  className: string | undefined;
 *  asofFormatted: any;
 *  activeAccounts: number | undefined;
 *  deletedAccounts: number | undefined;
 *  percentNumberBlocked1: number | undefined;
 *  percentNumberBlocking1: number | undefined;
 *  loading: boolean;
 *  stats: DashboardStats;
 *  onToggleTable?: () => void;
 * }} HomeStatsDetails
 */

/**
 * @param {{
 *  className?: string;
 * }} _
 */
export function HomeStats({ className }) {
  const [asTable, setAsTable] = useState(false);

  /** @type {DashboardStats | undefined} */
  const stats = forAwait(undefined, () => dashboardStats());

  const asofFormatted = stats?.asof && new Date(stats.asof) + '';

  let activeAccounts = undefined;
  let deletedAccounts = undefined;
  let percentNumberBlocked1 = undefined;
  let percentNumberBlocking1 = undefined;
  let loading = true;
  if (!isPromise(stats)) {
    activeAccounts = parseNumberWithCommas(stats?.active_count?.value);
    deletedAccounts = parseNumberWithCommas(stats?.deleted_count?.value);
    percentNumberBlocked1 = parseNumberWithCommas(stats?.percentNumberBlocked1?.value);
    percentNumberBlocking1 = parseNumberWithCommas(stats?.percentNumberBlocking1?.value);
    loading = false;
  }

  const arg = { className, asofFormatted, activeAccounts, deletedAccounts, percentNumberBlocked1, percentNumberBlocking1, loading, stats };

  if (asTable) return <HomeStatsTable {...arg} onToggleTable={() => setAsTable(false)} />;
  else return <HomeStatsMain {...arg} onToggleTable={() => setAsTable(true)} />;
}

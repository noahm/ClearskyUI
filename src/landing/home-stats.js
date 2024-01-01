// @ts-check
import React from 'react';

import { dashboardStats, isPromise } from '../api';

import './home-stats.css';
import { NetworkCircle } from './infographics/network-circle';
import { TopBlocked } from './infographics/top-blocked';
import { TopBlockers } from './infographics/top-blockers';
import { parseNumberWithCommas } from '../api/core';

/**
 * @param {{
 *  className?: string;
 * }} _
 */
export function HomeStats({ className }) {
  let duringRender = true;
  let [stats, setStats] = React.useState(() => {
    const statsOrPromise = dashboardStats();
    if (isPromise(statsOrPromise)) {
      statsOrPromise.then(
        asyncStats => {
          stats = asyncStats;
          if (duringRender)
            setTimeout(() => setStats(asyncStats));
          else
            setStats(asyncStats);
        });
    }
    return statsOrPromise;
  });
  duringRender = false;

  const asofFormatted = stats?.asof && new Date(stats.asof) + '';

  let activeAccounts = undefined;
  let deletedAccounts = undefined;
  let percentNumberBlocked1 = undefined;
  let percentNumberBlocking1 = undefined;
  let loading = true;
  if (!isPromise(stats)) {
    activeAccounts = parseNumberWithCommas(stats.active_count);
    deletedAccounts = parseNumberWithCommas(stats.deleted_count);
    percentNumberBlocked1 = parseNumberWithCommas(stats.percentNumberBlocked1);
    percentNumberBlocking1 = parseNumberWithCommas(stats.percentNumberBlocking1);
    loading = false;
  }

  return (
    <div className={className} style={{ padding: '0 1em' }}>
      <div style={{ fontSize: '60%', textAlign: 'right', color: 'silver' }}><i>{asofFormatted}</i></div>

      <NetworkCircle
        {...{
          activeAccounts,
          deletedAccounts,
          percentNumberBlocked1,
          percentNumberBlocking1,
          loading
        }} />
      
      <TopBlocked
        blocked={isPromise(stats) ? undefined : stats.blocked}
        blocked24={isPromise(stats) ? undefined : stats.blocked24}
      />

      <TopBlockers
        blockers={isPromise(stats) ? undefined : stats.blockers}
        blockers24={isPromise(stats) ? undefined : stats.blockers24}
      />

    </div>
  );
}

// @ts-check
import React from 'react';

import { dashboardStats, isPromise } from '../api';

import './home-stats.css';
import { FaceIcon } from './infographics/face-icon';
import { NetworkCircle } from './infographics/network-circle';

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

  return (
    <div className={className} style={{ padding: '0 1em' }}>
      <div style={{ fontSize: '60%', textAlign: 'right', color: 'silver' }}><i>{asofFormatted}</i></div>

      <NetworkCircle />

      <h2>JSON</h2>
      <pre>
        {
          JSON.stringify(stats, null, 2)
        }
      </pre>

    </div>
  );
}

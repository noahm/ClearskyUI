// @ts-check
/// <reference path="../types.d.ts" />

import { xAPIKey } from '.';
import { unwrapClearSkyURL } from './core';

/** @type {DashboardStats | Promise<DashboardStats> & { asof: string }} */
var prevDashboardStats;

export function dashboardStats() {

  const now = new Date();
  if (prevDashboardStats) {
    const prevDate = new Date(prevDashboardStats.asof);
    if (Math.abs(now.getTime() - prevDate.getTime()) < 1000 * 60)
      return prevDashboardStats;
  }

  const apiURL =
    unwrapClearSkyURL('/api/v1/lists/');
  const apiURL2 =
    unwrapClearSkyURL('/api/v1/');
  const headers = { 'X-API-Key': xAPIKey };

  const asof = now.toISOString();

  const totalUsersPromise = fetch(
    apiURL2 + 'total-users', { headers }).then(x => x.json())
    .catch(err => ({ totalUsers: err.message + ' CORS?' }));

  const funFactsPromise = fetch(
    apiURL + 'fun-facts', { headers }).then(x => x.json())
    .catch(err => ({ funFacts: err.message + ' CORS?' }));

  const funerFactsPromise = fetch(
    apiURL + 'funer-facts', { headers }).then(x => x.json())
    .catch(err => ({ funerFacts: err.message + ' CORS?' }));

  const blockStatsPromise = fetch(
    apiURL + 'block-stats', { headers }).then(x => x.json())
    .catch(err => ({ blockStats: err.message }));

  const promise = (async () => {

    const fetchResultList = await Promise.all([
      totalUsersPromise,
      funFactsPromise,
      funerFactsPromise,
      blockStatsPromise
    ]);

    /** @type {DashboardStats} */
    const result = {
      asof
    };

    for (const res of fetchResultList) {
      Object.assign(result, res?.data || res);
    }

    prevDashboardStats = result;

    return result;

  })();

  prevDashboardStats =
  /** @type {Promise<DashboardStats> & { asof: string }} */(promise);
  prevDashboardStats.asof = asof;

  return prevDashboardStats;
}
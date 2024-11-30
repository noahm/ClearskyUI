// @ts-check
/// <reference path="../types.d.ts" />

import { useQuery } from '@tanstack/react-query';
import { v1APIPrefix, xAPIKey } from '.';
import { unwrapClearSkyURL } from './core';

import initialData from './dashboard-stats-base.json';
const initialDataUpdatedAt = new Date(initialData.asof).valueOf();

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardStatsApi,
    initialData,
    initialDataUpdatedAt,
  });
}

async function dashboardStatsApi() {
  const apiURL = unwrapClearSkyURL(v1APIPrefix + 'lists/');
  const apiURL2 = unwrapClearSkyURL(v1APIPrefix);
  const headers = { 'X-API-Key': xAPIKey };

  /** @type {Promise<{ data: TotalUsers }>} */
  const totalUsersPromise = fetch(apiURL2 + 'total-users', { headers })
    .then((x) => x.json())
    .catch((err) => ({ totalUsers: err.message + ' CORS?' }));

  /** @type {Promise<{ asof: string; data: FunFacts; }>} */
  const funFactsPromise = fetch(apiURL + 'fun-facts', { headers })
    .then((x) => x.json())
    .catch((err) => ({ funFacts: err.message + ' CORS?' }));

  /** @type {Promise<{ asof: string; data: FunnerFacts; }>} */
  const funerFactsPromise = fetch(apiURL + 'funer-facts', { headers })
    .then((x) => x.json())
    .catch((err) => ({ funerFacts: err.message + ' CORS?' }));

  /** @type {Promise<{ asof: string; data: BlockStats; }>} */
  const blockStatsPromise = fetch(apiURL + 'block-stats', { headers })
    .then((x) => x.json())
    .catch((err) => ({ blockStats: err.message }));

  const [
    {
      data: { 'as of': asof, ...totalUsers },
    },
    funFacts,
    funnerFacts,
    blockStats,
  ] = await Promise.all([
    totalUsersPromise,
    funFactsPromise,
    funerFactsPromise,
    blockStatsPromise,
  ]);

  /** @type {DashboardStats} */
  const result = {
    asof,
    totalUsers,
    blockStats: blockStats.data,
    topLists: {
      ...funFacts.data,
      ...funnerFacts.data,
    },
  };
  return result;
}

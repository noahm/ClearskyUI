// @ts-check
/// <reference path="../types.d.ts" />

import { useQuery } from '@tanstack/react-query';
import { fetchClearskyApi } from './core';

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
  /** @type {Promise<{ data: TotalUsers }>} */
  const totalUsersPromise = fetchClearskyApi('v1', 'total-users').catch(
    (err) => ({ totalUsers: err.message + ' CORS?' })
  );

  /** @type {Promise<{ asof: string; data: FunFacts; }>} */
  const funFactsPromise = fetchClearskyApi('v1', 'lists/fun-facts').catch(
    (err) => ({ funFacts: err.message + ' CORS?' })
  );

  /** @type {Promise<{ asof: string; data: FunnerFacts; }>} */
  const funerFactsPromise = fetchClearskyApi('v1', 'lists/funer-facts').catch(
    (err) => ({ funerFacts: err.message + ' CORS?' })
  );

  /** @type {Promise<{ asof: string; data: BlockStats; }>} */
  const blockStatsPromise = fetchClearskyApi('v1', 'lists/block-stats').catch(
    (err) => ({ blockStats: err.message })
  );

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

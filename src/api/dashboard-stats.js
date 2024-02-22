// @ts-check
/// <reference path="../types.d.ts" />

import Dexie from 'dexie';
import { v1APIPrefix, xAPIKey } from '.';
import { unwrapClearSkyURL } from './core';

import dashboardStatsBase from './dashboard-stats-base.json';

/** @type {DashboardStats | Promise<DashboardStats> & { asof: string }} */
var prevDashboardStats;

export async function* dashboardStats() {
  if (prevDashboardStats) {
    const now = new Date();
    const prevDate = new Date(prevDashboardStats.asof);
    if (Math.abs(now.getTime() - prevDate.getTime()) < 1000 * 60)
      return { ...prevDashboardStats, loading: true };
  }

  yield dashboardStatsBase;
  const dashboardStatsIndexedDBPromise = dashboardStatsIndexedDB();
  const dashboardStatsApiPromise = dashboardStatsApi();
  try {
    const dashboardStatsIndexedDB = await dashboardStatsIndexedDBPromise;
    if (dashboardStatsIndexedDB?.asof)
      yield { ...dashboardStatsIndexedDB, loading: true };
  } catch (indexedDbError) {
    console.warn(indexedDbError);
  }

  {
    const dashboardStatsApiData = await dashboardStatsApiPromise;
    storeDashboardStatsIndexedDB(dashboardStatsApiData);
    yield dashboardStatsApiData;
  }
}

function indexedDBStore() {
  const db = new Dexie('local');
  db.version(1).stores({
    dashboardStats: 'key'
  });

  return /** @type {typeof db & { dashboardStats: import('dexie').Table }} */(db);
}

async function dashboardStatsIndexedDB() {
  const db = indexedDBStore();
  const dashboardStatsArray = await db.dashboardStats.toArray();
  return dashboardStatsArray?.[0]?.stats;
}

async function storeDashboardStatsIndexedDB(dashboardStats) {
  const db = indexedDBStore();
  await db.dashboardStats.put({ key: 'stats', stats: dashboardStats });
}

function dashboardStatsApi() {
  const now = new Date();

  const apiURL =
    unwrapClearSkyURL(v1APIPrefix + 'lists/');
  const apiURL2 =
    unwrapClearSkyURL(v1APIPrefix);
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
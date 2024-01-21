// @ts-check

import React, { useMemo } from 'react';

import { AgGridReact } from 'ag-grid-react';

import { ViewList } from '@mui/icons-material';
import { Button } from '@mui/material';

import './home-stats-table.css';

/**
 * @param {import('.').HomeStatsDetails} _
 */
export function HomeStatsTable({
  className,
  asofFormatted,
  activeAccounts,
  deletedAccounts,
  percentNumberBlocked1,
  percentNumberBlocking1,
  loading,
  stats,
  onToggleTable
}) {

  const { rows, columns } = useMemo(() =>
    getGridRowsAndColumns(stats),
    [stats]
  );

  return (
    <div className={'home-stats-table ' + (className || '')} style={{ padding: '0 1em' }}>
      <div className='home-stats-table-container'>
        <div className='as-of-subtitle' style={{ fontSize: '60%', color: 'silver' }}><i>{asofFormatted}</i></div>

        {
          loading ? undefined :
            <Button variant='contained' size='small' className='toggle-table' onClick={onToggleTable}>
              <ViewList />
            </Button>
        }

        <div className='home-stats-table-host ag-theme-quartz'>
          <AgGridReact
            columnDefs={columns}
            getRowClass={params => 
              !params?.data?.title ? undefined :
                /blocked/i.test(params?.data?.Handle || '') ? 'home-stats-table-title home-stats-table-title-blocked' :
                  /blockers/i.test(params?.data?.Handle || '') ? 'home-stats-table-title home-stats-table-title-blockers' :
                  'home-stats-table-title'}
            rowData={rows}
          />
        </div>

      </div>
    </div>
  );
}

/** @param {DashboardStats} stats */
function getGridRowsAndColumns(stats) {

  /** @type {Partial<DashboardBlockListEntry & { title: boolean }>[]} */
  const rows = [];

  rows.push({ Handle: 'Stats', title: true });
  const specialStats = ['asof', 'blocked', 'blocked24', 'blockers', 'blockers24', 'blocked_aid', 'blockers_aid'];
  for (const key in stats) {
    if (specialStats.indexOf(key) >= 0 || stats[key] == null || Array.isArray(stats[key])) continue;
    rows.push({ Handle: key, block_count: stats[key] });
  }

  if (stats.blocked?.length) {
    rows.push({ Handle: 'Blocked', block_count: stats.blocked.length, title: true });

    for (const blocked of stats.blocked) {
      rows.push(blocked);
    }
  }

  if (stats.blocked24?.length) {
    rows.push({ Handle: 'Blocked 24h', block_count: stats.blocked24.length, title: true });

    for (const blocked of stats.blocked24) {
      rows.push(blocked);
    }
  }

  if (stats.blockers?.length) {
    rows.push({ Handle: 'Blockers', block_count: stats.blockers.length, title: true });

    for (const blocked of stats.blockers) {
      rows.push(blocked);
    }
  }

  if (stats.blockers24?.length) {
    rows.push({ Handle: 'Blockers 24h', block_count: stats.blockers24.length, title: true });

    for (const blocked of stats.blockers24) {
      rows.push(blocked);
    }
  }

  return {
    rows,
    columns: [
      { field: 'Handle' },
      { field: 'block_count', headerName: 'Count' },
      { field: 'ProfileURL' },
      { field: 'did' },
    ]
  }

}

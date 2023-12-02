// @ts-check
import React from 'react';

import { TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import './search-header.css';

/**
 * @param {{
 *  className?: string,
 * } & Omit<Parameters<typeof TextField>[0], 'className'>} _
 */
export function SearchHeader({ className, ...props }) {
  return (
    <div className={'history-header ' + (className || '')}>
      <TextField
        aria-label='Search history'
        name='q'
        className='history-search-text-field'
        label={
          <>
            <span className='history-search-text-search-icon'><SearchIcon /></span>
            <span className='history-search-text-search-label'>Search history...</span>
          </>
        }
        variant='standard'
        {...props}
      />
    </div>
  );
}
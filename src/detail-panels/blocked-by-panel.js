// @ts-check

import React from 'react';

/**
 * 
 * @param {{
 *  account: Partial<AccountInfo> & { loading?: boolean }
 * }} _
 */
export function BlockedByPanel({ account }) {
  return (
    <div style={{
      backgroundColor: '#fefafa',
      backgroundImage: 'linear-gradient(to bottom, white, transparent 2em)',
      minHeight: '100%'
    }}>
      <button style={{position: 'sticky', top: 1}}>true</button><br />
      blocked by! <br />
      blocked by! <br />
      blocked by! <br />
      blocked by! <br />
      blocked by! <br />
      blocked by! <br />
      blocked by! <br />
      blocked by! <br />
      blocked by! <br />
      blocked by! <br />
      blocked by!


      <h1>Blocky</h1>

      <br />
      <br />
      <input type="checkbox" />
      <br />
      <br />


      <h2>Blocky</h2>

      <br />
      <br />
      <input type="checkbox" />
      <br />
      <br />

      <h3>Blocky</h3>

      <br />
      <br />
      <input type="checkbox" />
      <br />
      <br />

      <h4>Blocky</h4>

      <br />
      <br />
      <input type="checkbox" />
      <br />
      <br />


    </div>
  );
}
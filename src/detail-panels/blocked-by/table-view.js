// @ts-check

import React from 'react';

/**
 * @param {{
 *  account: AccountInfo | { shortHandle: String, loading: true };
 *  blocklist: BlockedByRecord[];
 * }} _ 
 */
export function TableView({ account, blocklist }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Blocked</th>
          <th>Handle</th>
        </tr>
      </thead>
      <tbody>
        {
          blocklist.map(block => (
            <tr>
              <td>{block.blocked_date}</td>
              <td>{block.handle}</td>
            </tr>
          ))
        }
      </tbody>
    </table>
  );
}

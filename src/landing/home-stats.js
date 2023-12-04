// @ts-check
import React from 'react';

/**
 * @param {{
 *  className?: string;
 * }} _
 */
export function HomeStats({ className }) {
  return (
    <div className={className} style={{ padding: '0 1em' }}>
      <h2>Stat 1</h2>
      <div>Value 1</div>

      <h2>Stat 2</h2>
      <div>Value 2</div>

      <h2>Stat 3</h2>
      <div>Value 3</div>

      <h2>Stat 4</h2>
      <div>Value 4</div>

    </div>
  );
}

// @ts-check

import React, { useEffect, useState } from 'react';

import { Tooltip } from '@mui/material';

/**
 * @param {{
 *  timestamp: number | string | Date,
 *  Component?: React.ElementType,
 * }} _ 
 */
export function FormatTimestamp({ timestamp, Component = 'span', ...props }) {
  const date = new Date(timestamp);
  const now = Date.now();

  let dateStr;
  let updateDelay;

  const dateTime = date.getTime();
  if (dateTime > now || date.getTime() < now - 1000 * 60 * 60 * 24 * 30) {
    dateStr = date.toLocaleDateString();
  }
  else {
    // TODO: localize
    const timeAgo = now - dateTime;
    if (timeAgo > 1000 * 60 * 60 * 48) {
      dateStr = Math.round(timeAgo / (1000 * 60 * 60 * 24)) + 'd';
      updateDelay = 1000 * 60 * 60 * 24;
    } else if (timeAgo > 1000 * 60 * 60 * 2) {
      dateStr = Math.round(timeAgo / (1000 * 60 * 60)) + 'h';
      updateDelay = 1000 * 60 * 60;
    } else if (timeAgo > 1000 * 60 * 2) {
      dateStr = Math.round(timeAgo / (1000 * 60)) + 'm';
      updateDelay = 1000 * 60;
    } else if (timeAgo > 1000 * 2) {
      dateStr = Math.round(timeAgo / 1000) + 's';
      updateDelay = 1000;
    } else {
      dateStr = 'now';
      updateDelay = 1000;
    }
  }

  const [_, setState] = useState(0);

  if (updateDelay) {
    useEffect(() => {
      const timeout = setTimeout(() => {
        setState(Date.now());
      }, updateDelay);
      return () => clearTimeout(timeout);
    });
  }

  return (
    <Tooltip title={date.toString()}>
      <Component {...props}>{dateStr}</Component>
    </Tooltip>
  );
}
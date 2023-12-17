// @ts-check
// <reference path="../types.d.ts" />

import React from 'react';
import { unwrapShortDID, unwrapShortHandle } from '../api';

/** @param {{ shortHandle: string | null | undefined }} _ */
export function FullHandle({ shortHandle }) {
  if (!shortHandle) return undefined;
  const fullHandle = unwrapShortHandle(shortHandle);
  if (shortHandle === fullHandle) return shortHandle;
  else return (<>
    {shortHandle}
    <span className='handle-std-suffix'>{fullHandle.slice(shortHandle.length)}</span>
  </>);
}

/** @param {{ shortDID: string | null | undefined }} _ */
export function FullDID({ shortDID }) {
  if (!shortDID) return undefined;
  const fullDID = unwrapShortDID(shortDID);
  if (shortDID === fullDID) return fullDID;
  else return (<>
    <span className='did-std-prefix'>{fullDID.slice(0, -shortDID.length)}</span>
    {shortDID}
  </>);
}

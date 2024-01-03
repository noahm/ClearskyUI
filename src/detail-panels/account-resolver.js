// @ts-check

import React, { Component, createContext, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { isPromise, resolveHandleOrDID, shortenHandle, unwrapShortHandle } from '../api';
import { useDerived } from '../common-components/derive';

const AccountContext = createContext(
  /** @type {AccountInfo | { shortHandle: String, loading: true } | undefined} */(
    undefined));

/**
 * @param {{
 *  children: React.ReactNode |
 *    ((account: AccountInfo | { shortHandle: String, loading: true }) => React.ReactNode)
 * }} _
 */
export function AccountResolver({ children }) {
  let { handle } = useParams();

  const account = useDerived(
    handle,
    resolveHandleOrDID
  ) || { shortHandle: unwrapShortHandle(handle), loading: true };

  if (typeof children === 'function')
    children = children(account);

  return (
    <AccountContext.Provider value={account}>
      {children}
    </AccountContext.Provider>
  );
}

AccountResolver.Consumer = AccountContext.Consumer;

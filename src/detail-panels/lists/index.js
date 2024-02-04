// @ts-check

import React from 'react';
import { forAwait } from '../../common-components/for-await';
import { getList } from '../../api/lists';

/**
 * @this {never}
 * @param {{
 *  className?: string,
 *  account: AccountInfo | { shortHandle: String, loading: true }
 * }} _
 */
export function Lists({ account }) {
  const list = forAwait(
    account?.shortHandle,
    async (shortHandle) => {
      const list = await getList(shortHandle);
      return { list, loading: false };
    }) || { loading: true };
  
  if (list.loading) return <p>Loading...</p>;

  return <pre>{JSON.stringify(list, null, 2)}</pre>;
}
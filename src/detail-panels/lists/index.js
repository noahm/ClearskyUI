// @ts-check

import React from 'react';
import { forAwait } from '../../common-components/for-await';
import { getList, getListCached } from '../../api/lists';
import { ListView } from './list-view';

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
      const lists = await getListCached(shortHandle);
      return { lists, loading: false };
    }) || { loading: true };
  
  const [tableView, setTableView] = React.useState(false);
  
  if (list.loading) return <p>Loading...</p>;

  return (
    <>
      <h3>
        {
          list?.lists?.length ? 
            <>
              Member in <span>{list.lists.length.toLocaleString()}</span> lists:
            </> :
            <>
              Not a member of any lists
            </>
        }
      </h3>
      <ListView
        account={account}
        list={list?.lists} />
    </>
  );
}
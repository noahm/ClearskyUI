// @ts-check
/// <reference path="../types.d.ts" />

import React, { useMemo, useState } from 'react';
import { isPromise } from '../api';

const EMPTY_ARRAY = [];

/**
 * @param {{
 *  loadAsync?: Function | any,
 *  renderAsync?: React.ReactNode | Function,
 *  renderError?: React.ReactNode | Function,
 *  dependencies?: any[],
 *  children?: React.ReactNode
 * }} _
 */
export function AsyncLoad({ loadAsync, renderAsync, renderError, dependencies, children, ...rest }) {

  if (!dependencies) dependencies = EMPTY_ARRAY;

  let [asyncState, setAsyncState] = useState(/** @type {{
    dependencies: any[],
    loading?: boolean,
    succeeded?: boolean,
    result?: any,
    error?: Error
  } | undefined} */(undefined));

  if (asyncState && equalArrays(asyncState.dependencies, dependencies)) {
    if (asyncState.loading) return <LoadingCase {...rest}>{children == null ? null : children}</LoadingCase>;
    else if (asyncState.succeeded) return <SuccessCase {...rest} result={asyncState.result} />;
    else return <ErrorCase {...rest} error={asyncState.error} renderError={renderError} />;
  }

  try {
    const load = typeof loadAsync === 'function' ? loadAsync(...dependencies) : loadAsync;

    const result = isPromise(load) ?
      load.then(load => typeof renderAsync === 'function' ? renderAsync(load, ...dependencies) : renderAsync) :
      typeof renderAsync === 'function' ? renderAsync(load, ...dependencies) : renderAsync;

    if (isPromise(result)) {
      setAsyncState({ dependencies, loading: true });
      result.then(
        result =>  setAsyncState({ dependencies, succeeded: true, result }),
        err => setAsyncState({ dependencies, succeeded: false, error: err }));
      
      return <LoadingCase {...rest}>{children}</LoadingCase>;
    } else {
      setAsyncState({ dependencies, succeeded: true, result});

      return <SuccessCase {...rest} result={result} />;
    }
  } catch (err) {
    setAsyncState({ dependencies, succeeded: false, error: err });

    return <ErrorCase {...rest} error={err} renderError={renderError} />
  }
}

function LoadingCase({ children, ...rest }) {
  return children == null ? null : children;
}

function SuccessCase({ result, ...rest }) {
  const Result = result;
  if (typeof result === 'function') return <Result {...rest} />;
  else if (result == null) return null;
  else return React.cloneElement(result, { ...rest });
}

function ErrorCase({ error, renderError, ...rest }) {
  const RenderError = renderError;
  if (typeof renderError === 'function') return <RenderError error={error} {...rest} />;
  else if (renderError == null) return null;
  else return React.cloneElement(renderError, { error, ...rest });
}

/**
 * @param {any[] | undefined} a
 * @param {any[] | undefined} b
 */
function equalArrays(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}
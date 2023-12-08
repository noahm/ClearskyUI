// @ts-check
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
} from "react-router-dom";

import { Home } from './landing/home';
import { AccountLayout } from './detail-panels/layout';
import { createTheme, ThemeProvider } from '@mui/material';

function detectBaseURL() {
  if (/file/i.test(location.protocol)) return './';

  if (['localhost', '127.0.0.1'].indexOf(location.hostname.toLowerCase()) >= 0) {
    var staticPos = location.pathname.toLowerCase().indexOf('/static/');
    if (staticPos >= 0) return location.pathname.slice(0, staticPos + '/static/'.length);
    var indexHTMLPos = location.pathname.toLowerCase().indexOf('/index.html');
    if (indexHTMLPos >= 0) return location.pathname.slice(0, indexHTMLPos + 1);
    return '/';
  }

  return '/';
}

function showApp() {

  console.log('the app was loaded');
  const loadingUI = document.getElementById('loading-ui');
  if (loadingUI) {
    loadingUI.parentElement?.removeChild(loadingUI);
  }

  const root = document.createElement('div');
  root.id = 'root';
  root.style.cssText = `
    min-height: 100%;
    display: grid;
  `;
  document.body.appendChild(root);

  const useRouter = /file/i.test(location.protocol) ?
    createHashRouter : createBrowserRouter;

  const router = useRouter(
    [
      { path: '/', element: <Home /> },
      { path: '/index.html', element: <Home /> },
      { path: '/stable/*', element: <Home /> },
      { path: '/:handle', element: <AccountLayout /> },
      { path: '/:handle/:tab', element: <AccountLayout /> }
    ], {
      basename:
        /file/i.test(location.protocol) ? undefined :
        detectBaseURL(),
  });

  const theme = createTheme({
    components: {
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: 'white',
            color: 'black',
            border: 'solid 1px #e8e8e8',
            boxShadow: '3px 3px 8px rgba(0, 0, 0, 12%)',
            fontSize: '90%',
            // maxWidth: '40em',
            padding: '0.7em',
            paddingRight: '0.2em'
          },
        },
      },
    },
  });

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </React.StrictMode>
  );
}

console.log('loading app...');
showApp();

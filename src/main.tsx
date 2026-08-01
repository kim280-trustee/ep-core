/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Application Entry Point
 * ============================================================
 */


import React from "react";

import ReactDOM from "react-dom/client";


import {
  ErrorBoundary,
} from "./core/error-boundary";


import {
  AppProviders,
} from "./core/providers";


import App from "./App";


import "./index.css";



ReactDOM
  .createRoot(
    document.getElementById(
      "root",
    )!,
  )
  .render(

    <React.StrictMode>

      <ErrorBoundary>

        <AppProviders>

          <App />

        </AppProviders>

      </ErrorBoundary>

    </React.StrictMode>

  );
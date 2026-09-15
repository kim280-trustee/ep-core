/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Application Entry
 * ============================================================
 */

import React from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
} from "react-router-dom";

import {
  AppProviders,
} from "./app/providers/AppProviders";

import App from "./App";

import "./styles/index.css";

if (
  typeof crypto !== "undefined" &&
  typeof crypto.randomUUID !== "function"
) {
  Object.defineProperty(
    crypto,
    "randomUUID",
    {
      value: () =>
        "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          (character) => {
            const random =
              Math.floor(Math.random() * 16);

            const value =
              character === "x"
                ? random
                : (random & 0x3) | 0x8;

            return value.toString(16);
          },
        ),
    },
  );
}

ReactDOM.createRoot(
  document.getElementById("root")!,
).render(

  <React.StrictMode>

    <BrowserRouter>

      <AppProviders>

        <App />

      </AppProviders>

    </BrowserRouter>

  </React.StrictMode>,

);

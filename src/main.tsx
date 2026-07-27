import React from "react";

import ReactDOM from "react-dom/client";

import {
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";


import {
  routes,
} from "./app/router/routes";


import {
  initializeRuntime,
} from "./core";


import {
  runSeed,
} from "./shared/testing";



initializeRuntime();


runSeed();



const router =
  createBrowserRouter(
    routes,
  );



ReactDOM.createRoot(
  document.getElementById("root")!,
)
.render(

  <React.StrictMode>

    <RouterProvider
      router={router}
    />

  </React.StrictMode>

);
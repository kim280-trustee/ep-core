/**
 * ============================================================
 * Cache Provider
 * ============================================================
 */

import type {
  PropsWithChildren,
} from "react";


import {
  CacheContext,
} from "./cache.context";


import {
  cacheService,
} from "./services/cache.service";



export function CacheProvider({

  children,

}: PropsWithChildren) {


  return (

    <CacheContext.Provider
      value={cacheService}
    >

      {children}

    </CacheContext.Provider>

  );

}
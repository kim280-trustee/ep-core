/**
 * ============================================================
 * Cache Context
 * ============================================================
 */

import {
  createContext,
} from "react";


import {
  cacheService,
} from "./services/cache.service";


export const CacheContext =
  createContext(
    cacheService,
  );
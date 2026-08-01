/**
 * ============================================================
 * Storage Context
 * ============================================================
 */

import {
  createContext,
} from "react";


import {
  storageService,
} from "./services/storage.service";


export const StorageContext =
  createContext(
    storageService,
  );
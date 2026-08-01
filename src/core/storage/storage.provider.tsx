/**
 * ============================================================
 * Storage Provider
 * ============================================================
 */

import type {
  PropsWithChildren,
} from "react";


import {
  StorageContext,
} from "./storage.context";


import {
  storageService,
} from "./services/storage.service";



export function StorageProvider({

  children,

}: PropsWithChildren) {


  return (

    <StorageContext.Provider
      value={storageService}
    >

      {children}

    </StorageContext.Provider>

  );

}
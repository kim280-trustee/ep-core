/**
 * ============================================================
 * Permission Provider
 * ============================================================
 */

import type {
  PropsWithChildren,
} from "react";

import {
  PermissionContext,
} from "./permission.context";

export function PermissionProvider({

  children,

}: PropsWithChildren) {

  return (

    <PermissionContext.Provider
      value={null}
    >

      {children}

    </PermissionContext.Provider>

  );

}
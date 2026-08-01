/**
 * ============================================================
 * Role Provider
 * ============================================================
 */

import type {
  PropsWithChildren,
} from "react";

import {
  RoleContext,
} from "./role.context";

export function RoleProvider({

  children,

}: PropsWithChildren) {

  return (

    <RoleContext.Provider
      value={null}
    >

      {children}

    </RoleContext.Provider>

  );

}
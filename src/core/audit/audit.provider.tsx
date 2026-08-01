/**
 * ============================================================
 * Audit Provider
 * ============================================================
 */

import type {
  PropsWithChildren,
} from "react";

import {
  AuditContext,
} from "./audit.context";

import {
  auditService,
} from "./services/audit.service";

export function AuditProvider({

  children,

}: PropsWithChildren) {

  return (

    <AuditContext.Provider
      value={auditService}
    >

      {children}

    </AuditContext.Provider>

  );

}
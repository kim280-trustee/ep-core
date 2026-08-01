/**
 * ============================================================
 * Audit Context
 * ============================================================
 */

import {
  createContext,
} from "react";

import {
  auditService,
} from "./services/audit.service";

export const AuditContext =
  createContext(
    auditService,
  );
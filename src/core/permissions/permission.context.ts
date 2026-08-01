/**
 * ============================================================
 * Permission Context
 * ============================================================
 */

import {
  createContext,
} from "react";

import type {
  Permission,
} from "./types/permission.types";

export const PermissionContext =
  createContext<
    Permission | null
  >(
    null,
  );
/**
 * ============================================================
 * Role Context
 * ============================================================
 */

import {
  createContext,
} from "react";

import type {
  Role,
} from "./types/role.types";

export const RoleContext =
  createContext<Role | null>(
    null,
  );
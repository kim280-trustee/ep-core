/**
 * User Context
 */

import {
  createContext,
} from "react";

import type {
  User,
} from "./types/user.types";

export const UserContext =
  createContext<User | null>(
    null,
  );
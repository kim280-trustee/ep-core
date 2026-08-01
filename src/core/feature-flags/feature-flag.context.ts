/**
 * ============================================================
 * Feature Flag Context
 * ============================================================
 */

import {
  createContext,
} from "react";


import {
  featureFlagService,
} from "./services/feature-flag.service";


export const FeatureFlagContext =
  createContext(
    featureFlagService,
  );
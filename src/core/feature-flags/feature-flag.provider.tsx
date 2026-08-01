/**
 * ============================================================
 * Feature Flag Provider
 * ============================================================
 */

import type {
  PropsWithChildren,
} from "react";


import {
  FeatureFlagContext,
} from "./feature-flag.context";


import {
  featureFlagService,
} from "./services/feature-flag.service";



export function FeatureFlagProvider({

  children,

}: PropsWithChildren) {


  return (

    <FeatureFlagContext.Provider
      value={featureFlagService}
    >

      {children}

    </FeatureFlagContext.Provider>

  );

}
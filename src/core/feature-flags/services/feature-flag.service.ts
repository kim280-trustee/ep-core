/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Feature Flag Service
 * ============================================================
 */

import type {
  FeatureFlag,
} from "../types/feature-flag.types";


class FeatureFlagService {


  private flags:
    Map<string, boolean> =
    new Map();



  register(
    flag: FeatureFlag,
  ) {

    this.flags.set(
      flag.key,
      flag.enabled,
    );

  }



  enable(
    key: string,
  ) {

    this.flags.set(
      key,
      true,
    );

  }



  disable(
    key: string,
  ) {

    this.flags.set(
      key,
      false,
    );

  }



  isEnabled(
    key: string,
  ) {

    return (
      this.flags.get(
        key,
      ) ?? false
    );

  }



  getAll() {

    return Object.fromEntries(
      this.flags,
    );

  }


}


export const featureFlagService =
  new FeatureFlagService();
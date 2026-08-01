/**
 * ============================================================
 * useFeatureFlags Hook
 * ============================================================
 */

import {
  featureFlagService,
} from "../services/feature-flag.service";


export function useFeatureFlags() {


  function isEnabled(
    key: string,
  ) {

    return featureFlagService.isEnabled(
      key,
    );

  }



  function enable(
    key: string,
  ) {

    featureFlagService.enable(
      key,
    );

  }



  function disable(
    key: string,
  ) {

    featureFlagService.disable(
      key,
    );

  }



  return {

    isEnabled,

    enable,

    disable,

  };

}
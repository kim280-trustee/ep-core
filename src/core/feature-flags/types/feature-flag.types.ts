/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Feature Flag Types
 * ============================================================
 */

export interface FeatureFlag {

  key: string;

  enabled: boolean;

  description?: string;

}


export type FeatureFlagKey =
  string;
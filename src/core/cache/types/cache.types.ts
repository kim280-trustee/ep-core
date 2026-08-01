/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Cache Types
 * ============================================================
 */

export interface CacheEntry<T = unknown> {

  key: string;

  value: T;

  expiresAt?: number;

}
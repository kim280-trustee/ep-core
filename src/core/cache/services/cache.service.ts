/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Cache Service
 * ============================================================
 */

import type {
  CacheEntry,
} from "../types/cache.types";


class CacheService {


  private cache:
    Map<string, CacheEntry> =
    new Map();



  set<T>(
    key: string,
    value: T,
    ttl?: number,
  ) {

    const entry:
      CacheEntry<T> =
    {

      key,

      value,

      expiresAt:
        ttl
          ? Date.now() + ttl
          : undefined,

    };


    this.cache.set(
      key,
      entry,
    );

  }



  get<T>(
    key: string,
  ): T | undefined {


    const entry =
      this.cache.get(
        key,
      );


    if (!entry) {

      return undefined;

    }



    if (
      entry.expiresAt &&
      Date.now() > entry.expiresAt
    ) {

      this.delete(
        key,
      );

      return undefined;

    }


    return entry.value as T;

  }



  has(
    key: string,
  ) {

    return this.get(key)
      !== undefined;

  }



  delete(
    key: string,
  ) {

    this.cache.delete(
      key,
    );

  }



  clear() {

    this.cache.clear();

  }



  getAll() {

    return Array.from(
      this.cache.values(),
    );

  }


}


export const cacheService =
  new CacheService();
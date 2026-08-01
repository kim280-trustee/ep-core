/**
 * ============================================================
 * useCache Hook
 * ============================================================
 */

import {
  cacheService,
} from "../services/cache.service";


export function useCache() {


  function set<T>(
    key: string,
    value: T,
    ttl?: number,
  ) {

    cacheService.set(
      key,
      value,
      ttl,
    );

  }



  function get<T>(
    key: string,
  ) {

    return cacheService.get<T>(
      key,
    );

  }



  function remove(
    key: string,
  ) {

    cacheService.delete(
      key,
    );

  }



  return {

    set,

    get,

    remove,

    clear:
      cacheService.clear.bind(
        cacheService,
      ),

  };

}
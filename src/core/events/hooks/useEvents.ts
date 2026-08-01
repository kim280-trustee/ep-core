/**
 * ============================================================
 * useEvents Hook
 * ============================================================
 */

import {
  eventBus,
} from "../services/event-bus.service";

import type {
  EventHandler,
} from "../types/event.types";


export function useEvents() {


  function publish<T>(
    name: string,
    payload: T,
  ) {

    eventBus.publish(
      name,
      payload,
    );

  }



  function subscribe<T>(
    name: string,
    handler: EventHandler<T>,
  ) {

    return eventBus.subscribe(
      name,
      handler,
    );

  }



  return {

    publish,

    subscribe,

  };

}
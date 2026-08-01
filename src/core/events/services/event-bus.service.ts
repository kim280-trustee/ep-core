/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Event Bus Service
 * ============================================================
 */

import type {
  CoreEvent,
  EventHandler,
} from "../types/event.types";


class EventBusService {

  private listeners:
    Map<
      string,
      EventHandler[]
    > =
    new Map();



  subscribe<T>(
    eventName: string,
    handler: EventHandler<T>,
  ) {

    const handlers =
      this.listeners.get(
        eventName,
      ) ?? [];


    handlers.push(
      handler as EventHandler,
    );


    this.listeners.set(
      eventName,
      handlers,
    );


    return () => {

      this.unsubscribe(
        eventName,
        handler,
      );

    };

  }



  publish<T>(
    name: string,
    payload: T,
  ) {

    const event:
      CoreEvent<T> =
    {

      name,

      payload,

      timestamp:
        new Date(),

    };


    const handlers =
      this.listeners.get(
        name,
      );


    handlers?.forEach(
      (handler) => {

        handler(event);

      },
    );

  }



  unsubscribe<T>(
    eventName: string,
    handler: EventHandler<T>,
  ) {

    const handlers =
      this.listeners.get(
        eventName,
      );


    if (!handlers) {

      return;

    }


    this.listeners.set(
      eventName,
      handlers.filter(
        (item) =>
          item !== handler,
      ),
    );

  }



  clear() {

    this.listeners.clear();

  }

}


export const eventBus =
  new EventBusService();
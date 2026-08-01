/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Event Provider
 * ============================================================
 */

import type {
  PropsWithChildren,
} from "react";


import {
  EventContext,
} from "./event.context";


import {
  eventBus,
} from "./services/event-bus.service";


export function EventProvider({

  children,

}: PropsWithChildren) {


  return (

    <EventContext.Provider
      value={eventBus}
    >

      {children}

    </EventContext.Provider>

  );

}
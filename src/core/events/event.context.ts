/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Event Context
 * ============================================================
 */

import {
  createContext,
} from "react";

import {
  eventBus,
} from "./services/event-bus.service";


export const EventContext =
  createContext(
    eventBus,
  );
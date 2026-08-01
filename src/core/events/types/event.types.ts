/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Event Types
 * ============================================================
 */

export interface CoreEvent<T = unknown> {

  name: string;

  payload: T;

  timestamp: Date;

}


export type EventHandler<T = unknown> =
  (
    event: CoreEvent<T>,
  ) => void;
/**
 * ============================================================
 * Audit Store
 * ============================================================
 */

import {
  create,
} from "zustand";

import type {
  AuditEvent,
} from "../types/audit.types";

interface AuditStore {

  events: AuditEvent[];

  setEvents(
    events: AuditEvent[],
  ): void;

}

export const useAuditStore =
  create<AuditStore>(
    (set) => ({

      events: [],

      setEvents(
        events,
      ) {

        set({

          events,

        });

      },

    }),
  );
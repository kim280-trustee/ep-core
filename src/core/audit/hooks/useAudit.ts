/**
 * ============================================================
 * useAudit
 * ============================================================
 */

import {
  useEffect,
} from "react";

import {
  auditService,
} from "../services/audit.service";

import {
  useAuditStore,
} from "../store/audit.store";

export function useAudit() {

  const {

    events,

    setEvents,

  } = useAuditStore();

  useEffect(
    () => {

      setEvents(
        auditService.getEvents(),
      );

    },
    [
      setEvents,
    ],
  );

  return {

    events,

  };

}
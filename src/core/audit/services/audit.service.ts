/**
 * ============================================================
 * Audit Service
 * ============================================================
 */

import type {
  AuditEvent,
} from "../types/audit.types";

class AuditService {

  private readonly events: AuditEvent[] = [];

  record(
    event: AuditEvent,
  ) {

    this.events.push(
      event,
    );

  }

  getEvents() {

    return this.events;

  }

  clear() {

    this.events.length = 0;

  }

}

export const auditService =
  new AuditService();
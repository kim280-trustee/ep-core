/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Core Startup
 * ============================================================
 */

import {
  registerAuditEventListeners,
} from "@/core/audit/listeners/audit.event.listener";

let initialized = false;

export function registerCoreServices() {

  if (initialized) {

    return;

  }

  initialized = true;

  registerAuditEventListeners();

}
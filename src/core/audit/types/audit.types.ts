/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Audit Types
 * ============================================================
 */

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "VIEW";

export interface AuditEvent {

  id: string;

  tenantId: string;

  userId: string;

  entity: string;

  entityId: string;

  action: AuditAction;

  description: string;

  timestamp: Date;

  metadata?: unknown;

}
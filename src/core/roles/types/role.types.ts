/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Role Types
 * ============================================================
 */

export type Permission = string;

export interface Role {

  id: string;

  tenantId: string;

  organizationId: string;

  name: string;

  description?: string;

  permissions: Permission[];

  createdAt: Date;

  updatedAt: Date;

}
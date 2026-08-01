/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Permission Types
 * ============================================================
 */

export interface Permission {

  id: string;

  tenantId: string;

  organizationId: string;

  code: string;

  name: string;

  description?: string;

  createdAt: Date;

  updatedAt: Date;

}
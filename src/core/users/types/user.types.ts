/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * User Types
 * ============================================================
 */

export type UserStatus =
  | "active"
  | "inactive"
  | "suspended";

export type UserRole =
  | "owner"
  | "admin"
  | "manager"
  | "cashier"
  | "staff";

export interface User {

  id: string;

  tenantId: string;

  organizationId: string;

  firstName: string;

  lastName: string;

  email: string;

  phone?: string;

  role: UserRole;

  status: UserStatus;

  createdAt: Date;

  updatedAt: Date;

}
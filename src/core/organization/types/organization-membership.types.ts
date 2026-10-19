/**
 * ============================================================
 * EP Core Organization Membership Types
 * ============================================================
 */

export type OrganizationMembershipStatus =
  | "invited"
  | "active"
  | "suspended"
  | "inactive";

export interface OrganizationMembership {
  id: string;
  tenantId: string;
  organizationId: string;
  userId: string;
  roleId: string | null;
  status: OrganizationMembershipStatus;
  createdAt: string;
  updatedAt: string;
}

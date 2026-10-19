/**
 * ============================================================
 * Organization Membership Repository Contract
 * ============================================================
 */

import type { OrganizationMembership } from "../types/organization-membership.types";

export interface OrganizationMembershipRepository {
  findAllByOrganization(organizationId: string): Promise<OrganizationMembership[]>;
  findAllByUser(userId: string): Promise<OrganizationMembership[]>;
  findById(id: string): Promise<OrganizationMembership | undefined>;
  create(membership: OrganizationMembership): Promise<OrganizationMembership>;
  update(id: string, data: Partial<OrganizationMembership>): Promise<OrganizationMembership | undefined>;
  delete(id: string): Promise<void>;
}

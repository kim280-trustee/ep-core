/**
 * Organization Repository Contract
 */

import type { Organization } from "../types/organization.types";

export interface OrganizationRepository {
  findAll(): Promise<Organization[]>;
  findById(id: string): Promise<Organization | undefined>;
  create(organization: Organization): Promise<Organization>;
  update(id: string, data: Partial<Organization>): Promise<Organization | undefined>;
  delete(id: string): Promise<void>;
}

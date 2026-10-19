/**
 * Organization Service
 */

import { supabaseOrganizationRepository } from "../repositories/supabase.organization.repository";
import type { Organization } from "../types/organization.types";

const organizationRepository = supabaseOrganizationRepository;

export const organizationService = {
  getOrganizations(): Promise<Organization[]> {
    return organizationRepository.findAll();
  },
  getOrganizationById(id: string): Promise<Organization | undefined> {
    return organizationRepository.findById(id);
  },
  createOrganization(organization: Organization): Promise<Organization> {
    return organizationRepository.create(organization);
  },
  updateOrganization(id: string, data: Partial<Organization>): Promise<Organization | undefined> {
    return organizationRepository.update(id, data);
  },
  deleteOrganization(id: string): Promise<void> {
    return organizationRepository.delete(id);
  },
};

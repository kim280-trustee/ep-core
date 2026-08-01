/**
 * ============================================================
 * Organization Repository Contract
 * ============================================================
 */


import type {
  Organization,
} from "../types/organization.types";



export interface OrganizationRepository {


  findAll(): Organization[];


  findById(
    id: string,
  ): Organization | undefined;



  create(
    organization: Organization,
  ): Organization;



  update(
    id: string,
    data: Partial<Organization>,
  ): Organization | undefined;



  delete(
    id: string,
  ): void;

}
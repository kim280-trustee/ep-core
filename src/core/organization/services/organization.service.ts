/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Organization Service
 * ============================================================
 */


import {
  InMemoryOrganizationRepository,
} from "../repositories";


import type {
  Organization,
} from "../types/organization.types";



const organizationRepository =
  new InMemoryOrganizationRepository();



export const organizationService = {



  getOrganizations(){

    return organizationRepository.findAll();

  },



  getOrganizationById(
    id: string,
  ){

    return organizationRepository.findById(
      id,
    );

  },



  createOrganization(
    organization: Organization,
  ){

    return organizationRepository.create(
      organization,
    );

  },



  updateOrganization(
    id: string,
    data: Partial<Organization>,
  ){

    return organizationRepository.update(
      id,
      data,
    );

  },



  deleteOrganization(
    id: string,
  ){

    return organizationRepository.delete(
      id,
    );

  },


};
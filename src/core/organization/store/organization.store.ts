/**
 * ============================================================
 * Organization Store
 * ============================================================
 */


import {
  create,
} from "zustand";


import type {
  Organization,
} from "../types/organization.types";



interface OrganizationState {


  organizations: Organization[];


  setOrganizations(
    organizations: Organization[],
  ): void;


}



export const useOrganizationStore =
create<OrganizationState>(
(set)=>({

  organizations: [],


  setOrganizations(
    organizations,
  ){

    set({
      organizations,
    });

  },


})
);
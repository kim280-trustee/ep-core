import {
  createContext,
} from "react";


import type {
  Organization,
} from "./types/organization.types";



export interface OrganizationContextValue {


  organization:
    Organization | null;


  setOrganization(
    organization: Organization | null,
  ): void;


}



export const OrganizationContext =
createContext<
OrganizationContextValue | undefined
>(
  undefined,
);
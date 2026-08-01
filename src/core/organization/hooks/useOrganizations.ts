import {
  useOrganizationStore,
} from "../store/organization.store";



export function useOrganizations(){

  return useOrganizationStore();

}
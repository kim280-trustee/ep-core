/**
 * ============================================================
 * In Memory Organization Repository
 * ============================================================
 */


import type {
  Organization,
} from "../types/organization.types";


import type {
  OrganizationRepository,
} from "./organization.repository";



export class InMemoryOrganizationRepository
implements OrganizationRepository {


  private organizations: Organization[] = [];



  findAll() {

    return this.organizations;

  }



  findById(
    id: string,
  ) {

    return this.organizations.find(
      item => item.id === id,
    );

  }



  create(
    organization: Organization,
  ) {

    this.organizations.push(
      organization,
    );


    return organization;

  }



  update(
    id: string,
    data: Partial<Organization>,
  ) {


    const index =
      this.organizations.findIndex(
        item => item.id === id,
      );


    if(index === -1){

      return undefined;

    }


    this.organizations[index] = {

      ...this.organizations[index],

      ...data,

      updatedAt:
        new Date().toISOString(),

    };


    return this.organizations[index];

  }



  delete(
    id:string,
  ){

    this.organizations =
      this.organizations.filter(
        item => item.id !== id,
      );

  }


}
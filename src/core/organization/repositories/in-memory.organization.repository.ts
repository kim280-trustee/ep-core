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



  async findAll() {

    return this.organizations;

  }



  async findById(
    id: string,
  ) {

    return this.organizations.find(
      item => item.id === id,
    );

  }



  async create(
    organization: Organization,
  ) {

    this.organizations.push(
      organization,
    );


    return organization;

  }



  async update(
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



  async delete(
    id:string,
  ){

    this.organizations =
      this.organizations.filter(
        item => item.id !== id,
      );

  }


}
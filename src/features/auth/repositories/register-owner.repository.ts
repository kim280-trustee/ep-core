import type {
  Tenant,
  User,
} from "../types";


export interface RegisterOwnerRepository {


  createTenant(
    tenant: Tenant,
  ): Promise<Tenant>;



  createUser(
    user: User,
  ): Promise<User>;



  createCompanySettings(
    data: {
      tenantId: string;

      businessName: string;
    },
  ): Promise<void>;



  createOwnerRole(
    tenantId: string,
  ): Promise<string>;



  assignUserRole(
    userId: string,

    roleId: string,
  ): Promise<void>;


}
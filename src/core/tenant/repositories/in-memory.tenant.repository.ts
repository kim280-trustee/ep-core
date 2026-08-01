/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Tenant Core
 * ------------------------------------------------------------
 * In Memory Tenant Repository
 * ============================================================
 */

import type {
  Tenant,
} from "../types/tenant.types";

import type {
  TenantRepository,
} from "./tenant.repository";



export class InMemoryTenantRepository
implements TenantRepository {


  private tenants: Tenant[] = [];



  findAll(): Tenant[] {

    return this.tenants;

  }



  findById(
    id: string,
  ): Tenant | undefined {

    return this.tenants.find(
      (tenant) => tenant.id === id,
    );

  }



  findByCode(
    code: string,
  ): Tenant | undefined {

    return this.tenants.find(
      (tenant) => tenant.code === code,
    );

  }



  create(
    tenant: Tenant,
  ): Tenant {

    this.tenants.push(
      tenant,
    );

    return tenant;

  }



  update(
    id: string,
    updates: Partial<Tenant>,
  ): Tenant | undefined {


    const index =
      this.tenants.findIndex(
        (tenant) => tenant.id === id,
      );


    if (index === -1) {
      return undefined;
    }


    this.tenants[index] = {
      ...this.tenants[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };


    return this.tenants[index];

  }



  delete(
    id: string,
  ): boolean {


    const before =
      this.tenants.length;


    this.tenants =
      this.tenants.filter(
        (tenant) => tenant.id !== id,
      );


    return this.tenants.length < before;

  }

}
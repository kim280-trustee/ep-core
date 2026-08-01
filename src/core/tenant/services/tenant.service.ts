/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Tenant Service
 * ============================================================
 */


import type {
  Tenant,
} from "../types/tenant.types";

import type {
  TenantRepository,
} from "../repositories/tenant.repository";



export class TenantService {


  constructor(
    private repository: TenantRepository,
  ) {}



  getTenants(): Tenant[] {

    return this.repository.findAll();

  }



  getTenant(
    id: string,
  ): Tenant | undefined {

    return this.repository.findById(id);

  }



  createTenant(
    tenant: Tenant,
  ): Tenant {


    const existing =
      this.repository.findByCode(
        tenant.code,
      );


    if (existing) {
      throw new Error(
        "Tenant code already exists",
      );
    }


    return this.repository.create(
      tenant,
    );

  }



  updateTenant(
    id: string,
    updates: Partial<Tenant>,
  ) {

    return this.repository.update(
      id,
      updates,
    );

  }



  deleteTenant(
    id: string,
  ) {

    return this.repository.delete(
      id,
    );

  }

}
/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Tenant Core
 * ------------------------------------------------------------
 * Tenant Repository Contract
 * ============================================================
 */

import type {
  Tenant,
} from "../types/tenant.types";



export interface TenantRepository {


  findAll(): Tenant[];



  findById(
    id: string,
  ): Tenant | undefined;



  findByCode(
    code: string,
  ): Tenant | undefined;



  create(
    tenant: Tenant,
  ): Tenant;



  update(
    id: string,
    updates: Partial<Tenant>,
  ): Tenant | undefined;



  delete(
    id: string,
  ): boolean;


}
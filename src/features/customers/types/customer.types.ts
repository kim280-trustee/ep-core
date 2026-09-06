/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Customers Module
 * ------------------------------------------------------------
 * Customer Type Definitions
 * ============================================================
 */

import type {
  CustomerStatus,
} from "./customer-status.types";


export type CustomerType =
  | "regular"
  | "wholesale"
  | "retail";


export interface Customer {

  id: string;

  tenantId: string;

  storeId: string;

  name: string;

  customerType: CustomerType;

  phone: string | null;

  email: string | null;

  address: string | null;

  taxNumber: string | null;

  creditLimit: number | null;

  status: CustomerStatus;

  createdAt: string;

  updatedAt: string;

}


export interface CreateCustomerDto {

  name: string;

  customerType: CustomerType;

  phone?: string | null;

  email?: string | null;

  address?: string | null;

  taxNumber?: string | null;

  creditLimit?: number | null;

}


export interface UpdateCustomerDto {

  name?: string;

  customerType?: CustomerType;

  phone?: string | null;

  email?: string | null;

  address?: string | null;

  taxNumber?: string | null;

  creditLimit?: number | null;

  status?: CustomerStatus;

}

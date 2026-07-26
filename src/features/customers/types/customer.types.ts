import type { CustomerStatus } from "./customer-status.types";

export interface Customer {
  id: string;

  tenantId: string;

  storeId: string;
 
  customerCode: string;

  name: string;

  firstName?: string;

  lastName?: string;

  phone?: string;

  email?: string;

  address?: string;

  customerType: "regular" | "wholesale";

  creditLimit?: number;

  status: CustomerStatus;

  createdAt: string;

  updatedAt: string;
}
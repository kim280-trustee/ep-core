export interface PaymentMethod {

  id: string;

  tenantId: string;

  storeId: string;

  name: string;

  code: string;

  type:
    | "cash"
    | "card"
    | "bank_transfer"
    | "qr"
    | "mobile_money"
    | "other";

  isDefault: boolean;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;

}
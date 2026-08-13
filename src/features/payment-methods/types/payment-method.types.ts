/**
 * ============================================================
 * E&P Technologies
 * Smart POS
 * Payment Method Types
 * ============================================================
 */


export type PaymentMethodStatus =

  | "ACTIVE"

  | "INACTIVE";



export interface PaymentMethod {


  id:string;


  tenantId:string;


  storeId:string;


  name:string;


  code:string;


  type:string;


  status:PaymentMethodStatus;


  createdAt:Date;


  updatedAt:Date;


}



export interface CreatePaymentMethodDto {


  name:string;


  code:string;


  type:string;


}



export type UpdatePaymentMethodDto =

  Partial<CreatePaymentMethodDto>;
export type PaymentMethodFormData = CreatePaymentMethodDto;

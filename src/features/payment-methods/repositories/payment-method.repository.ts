/**
 * ============================================================
 * E&P Technologies
 * Smart POS
 * Payment Method Repository
 * ============================================================
 */

import type {
  PaymentMethod,
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
} from "../types/payment-method.types";

export interface IPaymentMethodRepository {

  findAll(): PaymentMethod[];

  findById(
    id: string,
  ): PaymentMethod | undefined;

  create(
    tenantId: string,
    storeId: string,
    data: CreatePaymentMethodDto,
  ): PaymentMethod;

  update(
    id: string,
    updates: UpdatePaymentMethodDto,
  ): PaymentMethod | undefined;

  delete(
    id: string,
  ): boolean;

}
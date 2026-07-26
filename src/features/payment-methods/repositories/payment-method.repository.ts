import type {
  PaymentMethod,
} from "../types/payment-method.types";

export interface IPaymentMethodRepository {

  findAll(): PaymentMethod[];

  findById(
    id: string,
  ): PaymentMethod | undefined;

  create(
    paymentMethod: PaymentMethod,
  ): PaymentMethod;

  update(
    id: string,
    updates: Partial<PaymentMethod>,
  ): PaymentMethod | undefined;

  delete(
    id: string,
  ): boolean;

}
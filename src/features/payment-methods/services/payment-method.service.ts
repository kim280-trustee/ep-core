import {
  paymentMethodRepository,
} from "../repositories";

import type {
  PaymentMethod,
} from "../types/payment-method.types";

import type {
  PaymentMethodFormInput,
} from "../validators/payment-method.schema";


class PaymentMethodService {

  generateId(): string {

    return crypto.randomUUID();

  }


  getPaymentMethods(): PaymentMethod[] {

    return paymentMethodRepository.findAll();

  }


  getPaymentMethodById(
    id: string,
  ): PaymentMethod | undefined {

    return paymentMethodRepository.findById(
      id,
    );

  }


  createPaymentMethod(
    input: PaymentMethodFormInput,
    tenantId: string,
    storeId: string,
  ): PaymentMethod {

    const now =
      new Date().toISOString();

    const paymentMethod: PaymentMethod = {

      id:
        this.generateId(),

      tenantId,

      storeId,

      name:
        input.name,

      code:
        input.code,

      type:
        input.type,

      isDefault:
        input.isDefault,

      isActive:
        input.isActive,

      createdAt:
        now,

      updatedAt:
        now,

    };

    return paymentMethodRepository.create(
      paymentMethod,
    );

  }


  updatePaymentMethod(
    id: string,
    updates: Partial<PaymentMethod>,
  ) {

    return paymentMethodRepository.update(
      id,
      updates,
    );

  }


  deletePaymentMethod(
    id: string,
  ): boolean {

    return paymentMethodRepository.delete(
      id,
    );

  }

}


export const paymentMethodService =
  new PaymentMethodService();
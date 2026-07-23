import type {
  PaymentMethod,
} from "../types/payment-method.types";

import type {
  IPaymentMethodRepository,
} from "./payment-method.repository";


class InMemoryPaymentMethodRepository
  implements IPaymentMethodRepository {

  private paymentMethods:
    PaymentMethod[] = [];


  findAll(): PaymentMethod[] {

    return this.paymentMethods;

  }


  findById(
    id: string,
  ): PaymentMethod | undefined {

    return this.paymentMethods.find(
      (paymentMethod) =>
        paymentMethod.id === id,
    );

  }


  create(
    paymentMethod: PaymentMethod,
  ): PaymentMethod {

    this.paymentMethods.push(
      paymentMethod,
    );

    return paymentMethod;

  }


  update(
    id: string,
    updates: Partial<PaymentMethod>,
  ): PaymentMethod | undefined {

    const index =
      this.paymentMethods.findIndex(
        (paymentMethod) =>
          paymentMethod.id === id,
      );

    if (index === -1) {

      return undefined;

    }

    this.paymentMethods[index] = {

      ...this.paymentMethods[index],

      ...updates,

      updatedAt:
        new Date().toISOString(),

    };

    return this.paymentMethods[index];

  }


  delete(
    id: string,
  ): boolean {

    const index =
      this.paymentMethods.findIndex(
        (paymentMethod) =>
          paymentMethod.id === id,
      );

    if (index === -1) {

      return false;

    }

    this.paymentMethods.splice(
      index,
      1,
    );

    return true;

  }

}


export const inMemoryPaymentMethodRepository =
  new InMemoryPaymentMethodRepository();
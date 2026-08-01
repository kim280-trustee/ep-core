/**
 * ============================================================
 * E&P Technologies
 * Smart POS
 * In Memory Payment Method Repository
 * ============================================================
 */

import {
  v4 as uuid,
} from "uuid";

import type {
  PaymentMethod,
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
} from "../types/payment-method.types";

import type {
  IPaymentMethodRepository,
} from "./payment-method.repository";

class InMemoryPaymentMethodRepository
implements IPaymentMethodRepository {

  private paymentMethods: PaymentMethod[] = [];

  findAll(): PaymentMethod[] {

    return this.paymentMethods;

  }

  findById(
    id: string,
  ): PaymentMethod | undefined {

    return this.paymentMethods.find(

      paymentMethod =>
        paymentMethod.id === id,

    );

  }

  create(
    tenantId: string,
    storeId: string,
    data: CreatePaymentMethodDto,
  ): PaymentMethod {

    const paymentMethod: PaymentMethod = {

      id: uuid(),

      tenantId,

      storeId,

      name: data.name,

      code: data.code,

      type: data.type,

      status: "ACTIVE",

      createdAt: new Date(),

      updatedAt: new Date(),

    };

    this.paymentMethods.push(
      paymentMethod,
    );

    return paymentMethod;

  }

  update(
    id: string,
    updates: UpdatePaymentMethodDto,
  ): PaymentMethod | undefined {

    const existing =
      this.findById(id);

    if (!existing) {

      return undefined;

    }

    Object.assign(

      existing,

      updates,

      {

        updatedAt: new Date(),

      },

    );

    return existing;

  }

  delete(
    id: string,
  ): boolean {

    const index =
      this.paymentMethods.findIndex(

        paymentMethod =>
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
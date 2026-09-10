import {
  getSaleRepository,
} from "../repositories";

import {
  paymentService,
} from "../../payments/services";

import type {
  PaymentMethod as StoredPaymentMethod,
} from "../../payments/types/payment.types";

import type {
  Sale,
  SaleItem,
} from "../types";

interface CreateSaleInput {
  tenantId: string;
  storeId: string;
  warehouseId: string;
  customerId?: string;
  cashierId?: string;
}

function createSaleId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (character) => {
      const random = Math.random() * 16 | 0;
      const value =
        character === "x"
          ? random
          : (random & 0x3) | 0x8;

      return value.toString(16);
    },
  );
}
function roundMoney(
  value: number,
): number {
  return Math.round(
    (value + Number.EPSILON) * 100,
  ) / 100;
}

function normalizePaymentMethod(
  method: string,
): StoredPaymentMethod {
  switch (method.toUpperCase()) {
    case "CASH":
      return "CASH";

    case "CARD":
      return "CARD";

    case "QR":
      return "QR";

    case "MOBILE_MONEY":
    case "MOBILE MONEY":
      return "MOBILE_MONEY";

    case "TRANSFER":
    case "BANK_TRANSFER":
    case "BANK TRANSFER":
      return "BANK_TRANSFER";

    default:
      throw new Error(
        `Unsupported payment method: ${method}`,
      );
  }
}

class SaleService {
  createSale(
    input: CreateSaleInput,
  ): Sale {
    const now =
      new Date().toISOString();

    const sale: Sale = {
      id:
        createSaleId(),

      tenantId:
        input.tenantId,

      storeId:
        input.storeId,

      warehouseId:
        input.warehouseId,

      customerId:
        input.customerId,

      cashierId:
        input.cashierId,

      saleNumber:
        `SALE-${Date.now()}-${createSaleId().slice(0, 8)}`,

      status:
        "COMPLETED",

      items: [],

      subtotal: 0,

      discountAmount: 0,

      taxAmount: 0,

      totalAmount: 0,

      paymentStatus:
        "PENDING",

      createdAt:
        now,

      updatedAt:
        now,
    };

    return getSaleRepository()
      .create(sale);
  }

  addItem(
    saleId: string,
    item: SaleItem,
  ) {
    const sale =
      this.getSaleById(
        saleId,
      );

    if (!sale) {
      throw new Error(
        "Sale not found.",
      );
    }

    const items = [
      ...sale.items,
      item,
    ];

    return getSaleRepository()
      .update(
        saleId,
        {
          items,
          ...this.calculateTotals(
            items,
          ),
        },
      );
  }

  addItems(
    saleId: string,
    items: SaleItem[],
  ) {
    const sale =
      this.getSaleById(
        saleId,
      );

    if (!sale) {
      throw new Error(
        "Sale not found.",
      );
    }

    return getSaleRepository()
      .update(
        saleId,
        {
          items: [...items],
          ...this.calculateTotals(
            items,
          ),
        },
      );
  }

  async completePayment(
    saleId: string,
    paymentMethod: string,
  ) {
    if (!paymentMethod.trim()) {
      throw new Error(
        "Payment method is required.",
      );
    }

    const sale =
      this.getSaleById(
        saleId,
      );

    if (!sale) {
      throw new Error(
        "Sale not found.",
      );
    }

    if (sale.items.length === 0) {
      throw new Error(
        "Cannot complete a sale with no items.",
      );
    }

    const method =
      normalizePaymentMethod(
        paymentMethod,
      );

    const payment =
      await paymentService.createPayment(
        sale.tenantId,
        sale.id,
        method,
        sale.totalAmount,
      );

    if (!payment) {
      throw new Error(
        "Payment could not be created.",
      );
    }

    const completedPayment =
      await paymentService.completePayment(
        sale.tenantId,
        payment.id,
      );

    if (!completedPayment) {
      throw new Error(
        "Payment could not be completed.",
      );
    }

    return getSaleRepository()
      .update(
        saleId,
        {
          paymentStatus:
            "PAID",

          paymentMethod:
            paymentMethod,

          completedAt:
            new Date().toISOString(),
        },
      );
  }

  async completeSale(
    saleId: string,
  ) {
    const sale =
      this.getSaleById(
        saleId,
      );

    if (!sale) {
      throw new Error(
        "Sale not found.",
      );
    }

    if (sale.items.length === 0) {
      throw new Error(
        "Cannot complete a sale with no items.",
      );
    }

    if (
      sale.paymentStatus !==
      "PAID"
    ) {
      throw new Error(
        "Payment must be completed before completing the sale.",
      );
    }

    return getSaleRepository()
      .update(
        saleId,
        {
          paymentStatus:
            "PAID",

          completedAt:
            new Date().toISOString(),
        },
      );
  }

  voidSale(
    saleId: string,
  ) {
    return getSaleRepository()
      .update(
        saleId,
        {
          status:
            "VOIDED",
        },
      );
  }

  getSales() {
    return getSaleRepository()
      .findAll();
  }

  getSaleById(
    id: string,
  ) {
    return getSaleRepository()
      .findById(id);
  }

  private calculateTotals(
    items: SaleItem[],
  ) {
    let subtotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;

    for (const item of items) {
      const itemSubtotal =
        roundMoney(
          item.quantity *
            item.unitPrice,
        );

      const discount =
        roundMoney(
          Math.min(
            Math.max(
              0,
              item.discountAmount ?? 0,
            ),
            itemSubtotal,
          ),
        );

      const taxableAmount =
        roundMoney(
          itemSubtotal -
            discount,
        );

      const tax =
        roundMoney(
          taxableAmount *
            ((item.taxRate ?? 0) / 100),
        );

      subtotal =
        roundMoney(
          subtotal +
            itemSubtotal,
        );

      discountAmount =
        roundMoney(
          discountAmount +
            discount,
        );

      taxAmount =
        roundMoney(
          taxAmount +
            tax,
        );
    }

    return {
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount:
        roundMoney(
          subtotal -
            discountAmount +
            taxAmount,
        ),
    };
  }
}

export const saleService =
  new SaleService();




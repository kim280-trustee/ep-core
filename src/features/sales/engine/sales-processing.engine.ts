import type {
  SalesOrder,
} from "../types/sales-order.types";

export class SalesProcessingEngine {

  canConfirm(
    order: SalesOrder,
  ): boolean {

    return (
      order.status === "DRAFT" &&
      order.items.length > 0
    );

  }


  canProcess(
    order: SalesOrder,
  ): boolean {

    return (
      order.status === "CONFIRMED" &&
      order.items.length > 0
    );

  }


  canCancel(
    order: SalesOrder,
  ): boolean {

    return (
      order.status === "DRAFT" ||
      order.status === "CONFIRMED"
    );

  }


  confirm(
    order: SalesOrder,
  ): SalesOrder {

    if (!this.canConfirm(order)) {

      throw new Error(
        "Only a DRAFT sales order with at least one item can be confirmed.",
      );

    }

    return {
      ...order,
      status: "CONFIRMED",
      updatedAt:
        new Date().toISOString(),
    };

  }


  startProcessing(
    order: SalesOrder,
  ): SalesOrder {

    if (!this.canProcess(order)) {

      throw new Error(
        "Only a CONFIRMED sales order with at least one item can be processed.",
      );

    }

    return {
      ...order,
      status: "PROCESSING",
      updatedAt:
        new Date().toISOString(),
    };

  }


  complete(
    order: SalesOrder,
  ): SalesOrder {

    if (
      order.status !== "PROCESSING"
    ) {

      throw new Error(
        "Only a PROCESSING sales order can be completed.",
      );

    }

    return {
      ...order,
      status: "COMPLETED",
      paymentStatus:
        "PAID",
      updatedAt:
        new Date().toISOString(),
    };

  }


  cancel(
    order: SalesOrder,
  ): SalesOrder {

    if (!this.canCancel(order)) {

      throw new Error(
        "Only DRAFT or CONFIRMED sales orders can be cancelled.",
      );

    }

    return {
      ...order,
      status: "CANCELLED",
      updatedAt:
        new Date().toISOString(),
    };

  }

}


export const salesProcessingEngine =
  new SalesProcessingEngine();

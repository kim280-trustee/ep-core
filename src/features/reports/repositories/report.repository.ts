import { salesOrderService } from "@/features/sales/services/sales-order.service";
import { purchaseOrderService } from "@/features/purchasing/services/purchase-order.service";
import { expenseService } from "@/features/expenses/services/expense.service";
import { inventoryService } from "@/features/inventory/services/inventory.service";
import { inventoryTransactionService } from "@/features/inventory-transactions/services/inventory-transaction.service";
import { productService } from "@/features/products/services/product.service";
import { supplierService } from "@/features/suppliers/services/supplier.service";
import { customerService } from "@/features/customers/services/customer.service";
import { warehouseService } from "@/features/warehouses/services/warehouse.service";

import type {
  ReportCalculationInput,
} from "../engine";

import type {
  ReportFilter,
  ReportSummary,
  ReportSalesRow,
  ReportPurchaseRow,
  ReportExpenseRow,
  ReportInventoryRow,
} from "../types";

import { reportEngine } from "../engine";

const inRange = (
  date: string,
  range?: ReportFilter["dateRange"],
): boolean => {
  if (!range) return true;

  const value = date.slice(0, 10);

  if (
    range.from &&
    value < range.from.slice(0, 10)
  ) {
    return false;
  }

  if (
    range.to &&
    value > range.to.slice(0, 10)
  ) {
    return false;
  }

  return true;
};

const normalize = (
  value: string | null | undefined,
): string =>
  value?.trim().toUpperCase() || "";

export interface ReportRepository {
  getSummary(
    filter: ReportFilter,
  ): Promise<ReportSummary>;
}

export class DomainReportRepository
  implements ReportRepository {

  async getSummary(
    filter: ReportFilter,
  ): Promise<ReportSummary> {

    const [
      sales,
      purchases,
      inventory,
      productsResult,
      suppliers,
      customers,
      warehouses,
    ] = await Promise.all([
      salesOrderService.getOrders(
        filter.tenantId,
      ),

      purchaseOrderService.getOrders(
        filter.tenantId,
      ),

      inventoryService.getInventory(
        filter.tenantId,
      ),

      productService.getProducts(
        filter.tenantId,
      ),

      supplierService.getSuppliers(
        filter.tenantId,
        filter.storeId,
      ),

      Promise.resolve(
        customerService.getCustomers(filter.tenantId),
      ),

      Promise.resolve(
        warehouseService.getWarehouses(),
      ),
    ]);

    const expenses =
      filter.storeId
        ? await expenseService.getExpenses(
            filter.tenantId,
            filter.storeId,
          )
        : [];

    const inventoryTransactions =
      await inventoryTransactionService.getTransactions(
        filter.tenantId,
      );

    const warehouseIds =
      Array.from(
        new Set([
          ...sales
            .map(
              (order) =>
                order.warehouseId,
            )
            .filter(
              (
                id,
              ): id is string =>
                Boolean(id),
            ),

          ...purchases
            .map(
              (order) =>
                order.warehouseId,
            )
            .filter(
              (
                id,
              ): id is string =>
                Boolean(id),
            ),

          ...inventory
            .map(
              (record) =>
                record.warehouseId,
            )
            .filter(
              (
                id,
              ): id is string =>
                Boolean(id),
            ),
        ]),
      );

    const resolvedWarehouses =
      await Promise.all(
        warehouseIds.map(
          async (id) => {
            const warehouse =
              await warehouseService.getWarehouseById(
                id,
              );

            return warehouse
              ? [
                  warehouse.id,
                  warehouse.name,
                ] as const
              : null;
          },
        ),
      );

    const warehouseMap =
      new Map([
        ...warehouses.map(
          (warehouse) => [
            warehouse.id,
            warehouse.name,
          ] as const,
        ),

        ...resolvedWarehouses.filter(
          (
            entry,
          ): entry is readonly [
            string,
            string,
          ] =>
            entry !== null,
        ),
      ]);

    const storeWarehouseIds =
      filter.storeId
        ? warehouses
            .filter(
              (warehouse) =>
                warehouse.storeId ===
                filter.storeId,
            )
            .map(
              (warehouse) =>
                warehouse.id,
            )
        : undefined;

    const productMap =
      new Map(
        productsResult.data.map(
          (product) => [
            product.id,
            product.name,
          ],
        ),
      );

    const supplierMap =
      new Map(
        suppliers.map(
          (supplier) => [
            supplier.id,
            supplier.name,
          ],
        ),
      );

    const customerMap =
      new Map(
        customers.map(
          (customer) => [
            customer.id,
            customer.name,
          ],
        ),
      );

    const input:
      ReportCalculationInput = {
        sales: sales.map(
          (order) => ({
            storeId:
              order.storeId,

            status:
              order.status,

            totalAmount:
              order.totalAmount,

            createdAt:
              order.createdAt,

            updatedAt:
              order.updatedAt,
          }),
        ),

        purchases:
          purchases.map(
            (order) => ({
              storeId:
                order.storeId,

              status:
                order.status,

              currency:
                order.currency,

              totalAmount:
                order.totalAmount,

              orderDate:
                order.orderDate,

              updatedAt:
                order.updatedAt,

              items:
                order.items.map(
                  (item) => ({
                    quantity:
                      item.quantity,

                    receivedQuantity:
                      item.receivedQuantity,

                    unitCost:
                      item.unitCost,
                  }),
                ),
            }),
          ),

        expenses:
          expenses.map(
            (expense) => ({
              currency:
                expense.currency,

              amount:
                expense.amount,

              expenseDate:
                expense.expenseDate,
            }),
          ),

        inventory:
          inventory.map(
            (record) => ({
              warehouseId:
                record.warehouseId,

              quantityOnHand:
                record.quantityOnHand,

              averageCost:
                record.averageCost,
            }),
          ),

        inventoryTransactions:
          inventoryTransactions.map(
            (transaction) => ({
              storeId:
                transaction.storeId,

              warehouseId:
                transaction.warehouseId,

              movementType:
                transaction.movementType,

              quantity:
                transaction.quantity,

              unitCost:
                transaction.unitCost,

              referenceId:
                transaction.referenceId,

              createdAt:
                transaction.createdAt,
            }),
          ),

        filter: {
          storeId:
            filter.storeId,

          warehouseId:
            filter.warehouseId,

          currency:
            filter.currency,

          dateRange:
            filter.dateRange,

          storeWarehouseIds,
        },
      };

    const summary =
      reportEngine.calculate(
        input,
      );

    const salesRows:
      ReportSalesRow[] =
      sales
        .filter(
          (order) => {

            if (
              filter.storeId &&
              order.storeId !==
                filter.storeId
            ) {
              return false;
            }

            if (
              order.status !==
              "COMPLETED"
            ) {
              return false;
            }

            return inRange(
              order.createdAt,
              filter.dateRange,
            );
          },
        )
        .map(
          (order) => ({
            orderNumber:
              order.orderNumber,

            date:
              order.createdAt,

            customerName:
              order.customerId
                ? customerMap.get(
                    order.customerId,
                  ) ||
                  "Walk-in Customer"
                : "Walk-in Customer",

            warehouseName:
              warehouseMap.get(
                order.warehouseId,
              ) ||
              "Unknown Warehouse",

            itemCount:
              order.items.length,

            totalAmount:
              order.totalAmount,

            paymentStatus:
              order.paymentStatus,

            status:
              order.status,
          }),
        );

    const purchaseRows:
      ReportPurchaseRow[] =
      purchases
        .filter(
          (order) => {

            if (
              filter.storeId &&
              order.storeId !==
                filter.storeId
            ) {
              return false;
            }

            if (
              order.status !==
                "RECEIVED" &&
              order.status !==
                "PARTIALLY_RECEIVED"
            ) {
              return false;
            }

            if (
              filter.currency &&
              normalize(
                order.currency,
              ) !==
                normalize(
                  filter.currency,
                )
            ) {
              return false;
            }

            return inRange(
              order.orderDate ||
                order.updatedAt,
              filter.dateRange,
            );
          },
        )
        .map(
          (order) => ({
            orderNumber:
              order.orderNumber,

            date:
              order.orderDate ||
              order.updatedAt,

            supplierName:
              supplierMap.get(
                order.supplierId,
              ) ||
              "Unknown Supplier",

            warehouseName:
              order.warehouseId
                ? warehouseMap.get(
                    order.warehouseId,
                  ) ||
                  "Unknown Warehouse"
                : "No Warehouse",

            receivedQuantity:
              order.items.reduce(
                (
                  total,
                  item,
                ) =>
                  total +
                  Math.max(
                    0,
                    Number(
                      item.receivedQuantity,
                    ) || 0,
                  ),
                0,
              ),

            totalQuantity:
              order.items.reduce(
                (
                  total,
                  item,
                ) =>
                  total +
                  Math.max(
                    0,
                    Number(
                      item.quantity,
                    ) || 0,
                  ),
                0,
              ),

            totalAmount:
              order.totalAmount,

            currency:
              order.currency,

            status:
              order.status,
          }),
        );

    const expenseRows:
      ReportExpenseRow[] =
      expenses
        .filter(
          (expense) => {

            if (
              filter.currency &&
              normalize(
                expense.currency,
              ) !==
                normalize(
                  filter.currency,
                )
            ) {
              return false;
            }

            return inRange(
              expense.expenseDate,
              filter.dateRange,
            );
          },
        )
        .map(
          (expense) => ({
            date:
              expense.expenseDate,

            category:
              String(
                expense.category,
              ),

            description:
              expense.description,

            amount:
              expense.amount,

            currency:
              expense.currency,
          }),
        )
        .sort(
          (a, b) =>
            b.date.localeCompare(
              a.date,
            ),
        );

    const inventoryRows:
      ReportInventoryRow[] =
      inventory
        .filter(
          (record) => {

            if (
              filter.warehouseId &&
              record.warehouseId !==
                filter.warehouseId
            ) {
              return false;
            }

            if (
              filter.storeId &&
              !storeWarehouseIds?.includes(
                record.warehouseId,
              )
            ) {
              return false;
            }

            return true;
          },
        )
        .map(
          (record) => {

            const quantity =
              Number(
                record.quantityOnHand,
              ) || 0;

            const minimum =
              Number(
                record.minimumStockLevel,
              ) || 0;

            let stockStatus:
              ReportInventoryRow[
                "stockStatus"
              ];

            if (
              quantity <= 0
            ) {
              stockStatus =
                "OUT_OF_STOCK";
            } else if (
              quantity <= minimum
            ) {
              stockStatus =
                "LOW_STOCK";
            } else {
              stockStatus =
                "IN_STOCK";
            }

            return {
              productName:
                productMap.get(
                  record.productId,
                ) ||
                "Unknown Product",

              warehouseName:
                warehouseMap.get(
                  record.warehouseId,
                ) ||
                "Unknown Warehouse",

              quantityOnHand:
                quantity,

              availableQuantity:
                Number(
                  record.availableQuantity,
                ) || 0,

              averageCost:
                Number(
                  record.averageCost,
                ) || 0,

              inventoryValue:
                quantity *
                (Number(
                  record.averageCost,
                ) || 0),

              minimumStockLevel:
                minimum,

              stockStatus,
            };
          },
        )
        .sort(
          (a, b) =>
            a.productName.localeCompare(
              b.productName,
            ),
        );

    return {
      ...summary,
      salesRows,
      purchaseRows,
      expenseRows,
      inventoryRows,
    };
  }
}

export const reportRepository =
  new DomainReportRepository();


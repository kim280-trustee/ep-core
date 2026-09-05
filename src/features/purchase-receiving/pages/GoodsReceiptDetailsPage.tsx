import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGoodsReceipts } from "../hooks/useGoodsReceipts";
import { supplierService } from "@/features/suppliers/services/supplier.service";
import { warehouseService } from "@/features/warehouses/services/warehouse.service";
import { productService } from "@/features/products/services/product.service";
import { purchaseOrderRepository } from "@/features/purchasing/repositories";
import { storeContext } from "@/core/store/store.context";
import type { GoodsReceipt } from "../types/goods-receipt.types";

export default function GoodsReceiptDetailsPage() {
  const { id } = useParams();
  const { getById } = useGoodsReceipts();
  const context = storeContext.getStore();

  const [receipt, setReceipt] = useState<GoodsReceipt>();
  const [supplierName, setSupplierName] = useState("Loading...");
  const [warehouseName, setWarehouseName] = useState("Loading...");
  const [purchaseOrderNumber, setPurchaseOrderNumber] =
    useState("Loading...");
  const [productNames, setProductNames] =
    useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadReceipt() {
      if (!id || !context?.tenantId) return;

      const data = await getById(context.tenantId, id);

      if (!cancelled) {
        setReceipt(data);
      }
    }

    void loadReceipt();

    return () => {
      cancelled = true;
    };
  }, [id, context?.tenantId, getById]);

  useEffect(() => {
    let cancelled = false;

    async function loadNames() {
      if (!receipt) return;

      try {
        const [supplier, warehouse, order] = await Promise.all([
          supplierService.getSupplierById(
            receipt.tenantId,
            receipt.supplierId,
          ),
          warehouseService.getWarehouseById(
            receipt.warehouseId,
          ),
          purchaseOrderRepository.findById(
            receipt.tenantId,
            receipt.purchaseOrderId,
          ),
        ]);

        if (!cancelled) {
          setSupplierName(
            supplier?.name ?? "Unknown Supplier",
          );

          setWarehouseName(
            warehouse?.name ?? "Unknown Warehouse",
          );

          setPurchaseOrderNumber(
            order?.orderNumber ?? "Unknown Purchase Order",
          );
        }

        const names: Record<string, string> = {};

        await Promise.all(
          receipt.items.map(async (item) => {
            try {
              const product =
                await productService.getProductById(
                  receipt.tenantId,
                  item.productId,
                );

              names[item.productId] =
                product?.name ?? "Unknown Product";
            } catch {
              names[item.productId] = "Unknown Product";
            }
          }),
        );

        if (!cancelled) {
          setProductNames(names);
        }
      } catch {
        if (!cancelled) {
          setSupplierName("Unknown Supplier");
          setWarehouseName("Unknown Warehouse");
          setPurchaseOrderNumber("Unknown Purchase Order");
        }
      }
    }

    void loadNames();

    return () => {
      cancelled = true;
    };
  }, [receipt?.id]);

  if (!receipt) {
    return (
      <div>
        <h1>Goods Receipt</h1>
        <p>Goods receipt not found.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Goods Receipt Details</h1>

      <div>
        <p>
          Receipt Number: {receipt.receiptNumber}
        </p>

        <p>
          Purchase Order: {purchaseOrderNumber}
        </p>

        <p>
          Supplier: {supplierName}
        </p>

        <p>
          Warehouse: {warehouseName}
        </p>

        <p>
          Date: {receipt.receivedDate}
        </p>
      </div>

      <hr />

      <h2>Received Products</h2>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Cost</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {receipt.items.map((item) => (
            <tr key={item.id}>
              <td>
                {productNames[item.productId] ??
                  "Loading..."}
              </td>

              <td>{item.quantityReceived}</td>

              <td>{item.unitCost}</td>

              <td>{item.lineTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

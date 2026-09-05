import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  purchaseReturnService,
} from "../services/purchase-return.service";

import type {
  PurchaseReturn,
} from "../types";

import {
  purchaseOrderRepository,
} from "../../repositories";

import {
  supplierService,
} from "@/features/suppliers/services/supplier.service";

import {
  warehouseService,
} from "@/features/warehouses/services/warehouse.service";

import {
  productService,
} from "@/features/products/services/product.service";

import {
  storeContext,
} from "@/core/store/store.context";

export default function PurchaseReturnDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const context = storeContext.getStore();

  const [purchaseReturn, setPurchaseReturn] =
    useState<PurchaseReturn>();

  const [purchaseOrderNumber, setPurchaseOrderNumber] =
    useState("Loading...");

  const [supplierName, setSupplierName] =
    useState("Loading...");

  const [warehouseName, setWarehouseName] =
    useState("Loading...");

  const [productNames, setProductNames] =
    useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!context?.tenantId || !id) {
        return;
      }

      const data =
        await purchaseReturnService.getReturnById(
          context.tenantId,
          id,
        );

      if (cancelled) {
        return;
      }

      if (!data) {
        setPurchaseReturn(undefined);
        return;
      }

      setPurchaseReturn(data);

      const [
        order,
        supplier,
        warehouse,
      ] = await Promise.all([
        purchaseOrderRepository.findById(
          context.tenantId,
          data.purchaseOrderId,
        ),
        supplierService.getSupplierById(
          context.tenantId,
          data.supplierId,
        ),
        warehouseService.getWarehouseById(
          data.warehouseId,
        ),
      ]);

      if (cancelled) {
        return;
      }

      setPurchaseOrderNumber(
        order?.orderNumber ??
          "Unknown Purchase Order",
      );

      setSupplierName(
        supplier?.name ??
          "Unknown Supplier",
      );

      setWarehouseName(
        warehouse?.name ??
          "Unknown Warehouse",
      );

      const entries =
        await Promise.all(
          data.items.map(
            async (item) => {
              const product =
                await productService.getProductById(
                  context.tenantId,
                  item.productId,
                );

              return [
                item.productId,
                product
                  ? `${product.name} — SKU: ${product.sku}`
                  : "Unknown Product",
              ] as const;
            },
          ),
        );

      if (!cancelled) {
        setProductNames(
          Object.fromEntries(entries),
        );
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    context?.tenantId,
    id,
  ]);

  if (!purchaseReturn) {
    return (
      <div>
        <p>
          Purchase return not found.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/purchasing/returns",
            )
          }
        >
          Back to Purchase Returns
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>
        Purchase Return Details
      </h1>

      <p>
        Return Number:{" "}
        {purchaseReturn.returnNumber}
      </p>

      <p>
        Purchase Order:{" "}
        {purchaseOrderNumber}
      </p>

      <p>
        Supplier:{" "}
        {supplierName}
      </p>

      <p>
        Warehouse:{" "}
        {warehouseName}
      </p>

      <p>
        Status:{" "}
        {purchaseReturn.status}
      </p>

      <p>
        Reason:{" "}
        {purchaseReturn.reason ??
          "No reason provided"}
      </p>

      <h2>
        Returned Items
      </h2>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Cost</th>
            <th>Total</th>
            <th>Reason</th>
          </tr>
        </thead>

        <tbody>
          {purchaseReturn.items.map(
            (item) => (
              <tr key={item.id}>
                <td>
                  {productNames[item.productId] ??
                    "Unknown Product"}
                </td>

                <td>
                  {item.quantity}
                </td>

                <td>
                  {item.unitCost}
                </td>

                <td>
                  {item.lineTotal}
                </td>

                <td>
                  {item.reason ??
                    purchaseReturn.reason ??
                    "No reason provided"}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>

      <h2>
        Total Return Value:{" "}
        {purchaseReturn.totalAmount}
      </h2>

      <button
        type="button"
        onClick={() =>
          navigate(
            "/purchasing/returns",
          )
        }
      >
        Back to Purchase Returns
      </button>
    </div>
  );
}

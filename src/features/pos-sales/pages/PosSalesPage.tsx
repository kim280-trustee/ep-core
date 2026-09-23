import { useEffect, useState } from "react";
import { ProductSearch } from "../components/ProductSearch";
import { Cart } from "../components/Cart";
import { CheckoutPanel } from "../components/CheckoutPanel";
import { SaleHistory } from "../components/SaleHistory";
import { ReceiptView } from "../components/ReceiptView";
import { productService } from "../../products/services/product.service";
import type { Product } from "../../products/types/product.types";
import { storeContext } from "@/core/store/store.context";
import { warehouseRepository } from "@/features/warehouses/repositories";
import type { Warehouse } from "@/features/warehouses/types/warehouse.types";
import { settingsService } from "@/features/settings/services";
import type { CompanySettings } from "@/features/settings/types";
import { usePosSalesStore } from "../store/pos-sales.store";
import { receiptEngine } from "../engine";
import type { Receipt } from "../engine";
import type { Payment } from "@/features/payments/types/payment.types";
import type { SalesOrder } from "@/features/sales/types/sales-order.types";

export function PosSalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [latestReceipt, setLatestReceipt] = useState<Receipt | null>(null);
  const [settings, setSettings] = useState<CompanySettings | undefined>(undefined);
  const context = storeContext.getStore();
  const setContext = usePosSalesStore((state) => state.setContext);

  useEffect(() => {
    if (!context?.tenantId || !context.storeId) return;
    setContext({ tenantId: context.tenantId, storeId: context.storeId });
  }, [context?.tenantId, context?.storeId, setContext]);

  useEffect(() => {
    async function loadData() {
      if (!context?.tenantId || !context.storeId) return;

      try {
        const [productResult, allWarehouses] = await Promise.all([
          productService.getAllProducts(context.tenantId),
          warehouseRepository.findAll(),
        ]);

        setProducts(productResult);

        const tenantWarehouses = allWarehouses.filter(
          (warehouse) =>
            warehouse.tenantId === context.tenantId &&
            warehouse.status === "ACTIVE",
        );

        const storeWarehouses = tenantWarehouses.filter(
          (warehouse) => warehouse.storeId === context.storeId,
        );

        const available = storeWarehouses.length > 0
          ? storeWarehouses
          : tenantWarehouses;

        setWarehouses(available);

        const firstWarehouse = available[0];

        if (firstWarehouse) {
          setWarehouseId(firstWarehouse.id);
          setContext({ warehouseId: firstWarehouse.id });
        }

        setSettings(settingsService.getSettings(context.tenantId));
      } catch (error) {
        console.error("Failed to load POS data:", error);
      }
    }

    void loadData();
  }, [context?.tenantId, context?.storeId, setContext]);

  function handleWarehouseChange(value: string) {
    setWarehouseId(value);
    setContext({ warehouseId: value });
  }

  function handleSaleCompleted(
    order: SalesOrder,
    payment: Payment,
    cashReceived?: number,
  ) {
    setLatestReceipt(receiptEngine.generate(order, payment, cashReceived));
  }

  return (
    <div className="w-full min-w-0 p-3 sm:p-6">
      <h1 className="text-2xl font-semibold">POS Sales</h1>

      <div className="mt-4 w-full rounded border p-3 sm:p-4">
        <label className="mb-1 block text-sm font-medium">Warehouse</label>
        <select
          value={warehouseId}
          onChange={(event) => handleWarehouseChange(event.target.value)}
          className="w-full min-w-0 rounded border p-2"
        >
          <option value="">Select warehouse</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="min-w-0 rounded border p-3 sm:p-4">
          <h2 className="mb-4 font-medium">Products</h2>
          <ProductSearch
            products={products}
            tenantId={context?.tenantId}
            taxRate={settings?.taxRate}
            taxEnabled={settings?.taxEnabled}
          />
        </div>

        <div className="min-w-0 rounded border p-3 sm:p-4">
          <Cart />
        </div>
      </div>

      <div className="mt-6 min-w-0">
        <CheckoutPanel onSaleCompleted={handleSaleCompleted} />
      </div>

      {latestReceipt && (
        <div className="mt-6 min-w-0 overflow-x-auto">
          <ReceiptView receipt={latestReceipt} products={products} />
        </div>
      )}

      <div className="mt-6 min-w-0">
        <SaleHistory products={products} />
      </div>
    </div>
  );
}

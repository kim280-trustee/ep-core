import { useEffect, useState } from "react";
import { useProductsStore } from "@/features/products";
import { storeContext } from "@/core/store/store.context";
import { inventoryTransactionService } from "@/features/inventory-transactions";
import { inventoryService } from "../services/inventory.service";
import { warehouseService } from "@/features/warehouses";
import { useInventoryStore } from "../store/inventory.store";
import type { Warehouse } from "@/features/warehouses";
import { useTranslation } from "@/core/i18n/useTranslation";

interface ReceiveStockFormProps {
  initialProductId?: string;
  initialWarehouseId?: string;
  initialQuantity?: number;
  onRestockRequestHandled?: () => void;
}

export function ReceiveStockForm({ initialProductId, initialWarehouseId, initialQuantity, onRestockRequestHandled }: ReceiveStockFormProps) {
  const products = useProductsStore((state) => state.products);
  const loadProducts = useProductsStore((state) => state.loadProducts);
  const setRecords = useInventoryStore((state) => state.setRecords);
  const { t } = useTranslation();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [productId, setProductId] = useState(initialProductId ?? "");
  const [warehouseId, setWarehouseId] = useState(initialWarehouseId ?? "");
  const [quantity, setQuantity] = useState(initialQuantity ?? 0);
  const [cost, setCost] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (products.length === 0) void loadProducts();
  }, [products.length, loadProducts]);

  useEffect(() => {
    async function loadWarehouses() {
      const context = storeContext.getStore();
      if (!context) return;
      try {
        const allWarehouses = await warehouseService.getWarehouses();
        const activeWarehouses = allWarehouses.filter((warehouse) => warehouse.tenantId === context.tenantId && warehouse.storeId === context.storeId && warehouse.status === "ACTIVE");
        setWarehouses(activeWarehouses);
        if (!initialWarehouseId && !warehouseId && activeWarehouses.length > 0) {
          const mainWarehouse = activeWarehouses.find((warehouse) => warehouse.code.toUpperCase() === "MAIN");
          setWarehouseId(mainWarehouse?.id ?? activeWarehouses[0].id);
        }
      } catch (error) {
        console.error("Failed to load warehouses:", error);
        setMessage(error instanceof Error ? error.message : t("inventory.unableToLoadWarehouses"));
      }
    }
    void loadWarehouses();
  }, [initialWarehouseId, t]);

  useEffect(() => {
    if (initialProductId !== undefined) setProductId(initialProductId);
    if (initialWarehouseId !== undefined) setWarehouseId(initialWarehouseId);
    if (initialQuantity !== undefined) setQuantity(initialQuantity);
    if (initialProductId !== undefined || initialWarehouseId !== undefined || initialQuantity !== undefined) setMessage("");
  }, [initialProductId, initialWarehouseId, initialQuantity]);

  async function handleSubmit() {
    setMessage("");
    const context = storeContext.getStore();
    if (!context) return setMessage(t("inventory.storeContextNotInitialized"));
    if (!productId) return setMessage(t("inventory.productRequired"));
    if (!warehouseId) return setMessage(t("inventory.warehouseRequired"));
    if (quantity <= 0) return setMessage(t("inventory.quantityGreaterThanZero"));
    if (cost < 0) return setMessage(t("inventory.costNotNegative"));

    setSubmitting(true);
    try {
      await inventoryTransactionService.receiveStock(productId, warehouseId, quantity, cost, undefined, "Stock received");
      const updatedInventory = await inventoryService.getInventory(context.tenantId);
      setRecords(updatedInventory);
      setMessage(t("inventory.stockReceivedSuccessfully"));
      setQuantity(0);
      setCost(0);
      setProductId("");
      onRestockRequestHandled?.();
    } catch (error) {
      console.error("Failed to receive stock:", error);
      setMessage(error instanceof Error ? error.message : t("inventory.unableToReceiveStock"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border rounded p-4 flex flex-col gap-4">
      <h2 className="font-semibold">{t("inventory.receiveStock")}</h2>
      <label>{t("inventory.product")}</label>
      <select value={productId} onChange={(event) => setProductId(event.target.value)} className="border rounded p-2" disabled={submitting}>
        <option value="">{t("inventory.selectProduct")}</option>
        {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.identifiers.sku})</option>)}
      </select>
      <label>{t("inventory.warehouse")}</label>
      <select value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} className="border rounded p-2" disabled={submitting || warehouses.length === 0}>
        <option value="">{t("inventory.selectWarehouse")}</option>
        {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
      </select>
      {warehouses.length === 0 && <p className="text-sm text-red-600">{t("inventory.noActiveWarehouse")}</p>}
      <label>{t("common.quantity")}</label>
      <input type="number" min="0" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="border rounded p-2" disabled={submitting} />
      <label>{t("inventory.costPerUnit")}</label>
      <input type="number" min="0" value={cost} onChange={(event) => setCost(Number(event.target.value))} className="border rounded p-2" disabled={submitting} />
      <button type="button" onClick={() => void handleSubmit()} disabled={submitting || warehouses.length === 0} className="bg-black text-white rounded p-2 disabled:opacity-50">
        {submitting ? t("inventory.receiving") : t("inventory.receiveStock")}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

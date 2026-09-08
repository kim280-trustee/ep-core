import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ClipboardCheck,
  Package,
  Truck,
  Warehouse,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { usePurchaseOrderStore } from "@/features/purchasing/store/purchase-order.store";
import { storeContext } from "@/core/store/store.context";
import { productService } from "@/features/products/services/product.service";
import { supplierService } from "@/features/suppliers/services/supplier.service";
import { warehouseService } from "@/features/warehouses/services/warehouse.service";
import { goodsReceiptService } from "../services/goods-receipt.service";
import { useTranslation } from "@/core/i18n/useTranslation";

export default function CreateGoodsReceiptPage() {
  const [searchParams] = useSearchParams();
  const requestedPurchaseOrderId = searchParams.get("purchaseOrderId");
  const { t } = useTranslation();

  const purchaseOrders = usePurchaseOrderStore((state) => state.orders);
  const loadPurchaseOrders = usePurchaseOrderStore((state) => state.loadOrders);
  const context = storeContext.getStore();

  const [purchaseOrderId, setPurchaseOrderId] = useState(searchParams.get("purchaseOrderId") ?? "");
  const [purchaseOrderItemId, setPurchaseOrderItemId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [message, setMessage] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [productNames, setProductNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!requestedPurchaseOrderId) return;
    const requestedOrder = purchaseOrders.find((order) => order.id === requestedPurchaseOrderId);
    if (requestedOrder) setPurchaseOrderId(requestedPurchaseOrderId);
  }, [requestedPurchaseOrderId, purchaseOrders]);

  useEffect(() => {
    if (context?.tenantId) void loadPurchaseOrders(context.tenantId);
  }, [context?.tenantId, loadPurchaseOrders]);

  const receivableOrders = useMemo(
    () => purchaseOrders.filter((order) => order.status === "APPROVED" || order.status === "PARTIALLY_RECEIVED"),
    [purchaseOrders],
  );

  const selectedOrder = purchaseOrders.find((order) => order.id === purchaseOrderId);
  const receivableItems = useMemo(
    () => selectedOrder?.items.filter((item) => item.receivedQuantity < item.quantity) ?? [],
    [selectedOrder],
  );
  const selectedItem = receivableItems.find((item) => item.id === purchaseOrderItemId);

  useEffect(() => {
    let cancelled = false;
    async function loadNames() {
      if (!selectedOrder || !context?.tenantId) {
        setSupplierName("");
        setWarehouseName("");
        return;
      }
      try {
        const supplier = await supplierService.getSupplierById(context.tenantId, selectedOrder.supplierId);
        const warehouse = selectedOrder.warehouseId ? await warehouseService.getWarehouseById(selectedOrder.warehouseId) : undefined;
        if (!cancelled) {
          setSupplierName(supplier?.name ?? t("common.unknown"));
          setWarehouseName(warehouse?.name ?? t("common.unknown"));
        }
      } catch {
        if (!cancelled) {
          setSupplierName(t("common.unknown"));
          setWarehouseName(t("common.unknown"));
        }
      }
    }
    void loadNames();
    return () => { cancelled = true; };
  }, [context?.tenantId, selectedOrder?.id, selectedOrder?.supplierId, selectedOrder?.warehouseId, t]);

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      if (!context?.tenantId || !selectedOrder) {
        setProductNames({});
        return;
      }
      const entries = await Promise.all(
        receivableItems.map(async (item) => {
          try {
            const product = await productService.getProductById(context.tenantId, item.productId);
            return [item.productId, product ? `${product.name} — SKU: ${product.sku}` : t("common.unknown")] as const;
          } catch {
            return [item.productId, t("common.unknown")] as const;
          }
        }),
      );
      if (!cancelled) setProductNames(Object.fromEntries(entries));
    }
    void loadProducts();
    return () => { cancelled = true; };
  }, [context?.tenantId, selectedOrder?.id, receivableItems, t]);

  async function handleSubmit() {
    setMessage("");
    if (!context?.tenantId) return setMessage(t("sales.tenantContextNotInitialized"));
    if (!context.storeId) return setMessage(t("sales.storeContextNotInitialized"));
    if (!selectedOrder) return setMessage(t("receiving.selectPurchaseOrder"));
    if (!selectedOrder.warehouseId) return setMessage(t("receiving.warehouse"));
    if (!selectedItem) return setMessage(t("receiving.selectItem"));
    if (quantity <= 0) return setMessage(t("inventory.quantityGreaterThanZero"));

    const remaining = selectedItem.quantity - selectedItem.receivedQuantity;
    if (quantity > remaining) return setMessage(`${t("receiving.remainingQuantity")}: ${remaining}.`);

    try {
      const receipt = await goodsReceiptService.createReceipt({
        tenantId: context.tenantId,
        storeId: context.storeId,
        purchaseOrderId: selectedOrder.id,
        supplierId: selectedOrder.supplierId,
        warehouseId: selectedOrder.warehouseId,
        items: [{
          id: crypto.randomUUID(),
          purchaseOrderItemId: selectedItem.id,
          productId: selectedItem.productId,
          quantityReceived: quantity,
          unitCost: selectedItem.unitCost,
        }],
      });
      setMessage(`${receipt.receiptNumber}: ${t("receiving.inventoryUpdated")}.`);
      setPurchaseOrderId("");
      setPurchaseOrderItemId("");
      setQuantity(0);
      await loadPurchaseOrders(context.tenantId);
    } catch (error) {
      console.error("Failed to create goods receipt:", error);
      setMessage(error instanceof Error ? error.message : t("inventory.unableToReceiveStock"));
    }
  }

  const remainingQuantity = selectedItem ? selectedItem.quantity - selectedItem.receivedQuantity : 0;

  return (
    <div className="min-h-full bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
          <div className="px-6 py-7 sm:px-8 sm:py-9">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300"><ClipboardCheck className="h-3.5 w-3.5" /> {t("navigation.purchasing")}</div>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t("receiving.createGoodsReceipt")}</h1>
                <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">{t("receiving.goodsReceipts")}</p>
              </div>
              <div className="hidden rounded-2xl border border-blue-400/20 bg-blue-500/10 p-3 text-blue-300 sm:block"><ClipboardCheck className="h-7 w-7" /></div>
            </div>
          </div>
          <div className="grid border-t border-white/10 bg-white/5 sm:grid-cols-2">
            <div className="flex items-center gap-3 px-6 py-4 sm:px-8"><Truck className="h-5 w-5 text-blue-400" /><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("receiving.supplier")}</p><p className="mt-1 truncate font-semibold text-white">{supplierName || t("receiving.selectPurchaseOrder")}</p></div></div>
            <div className="flex items-center gap-3 px-6 py-4 sm:px-8"><Warehouse className="h-5 w-5 text-blue-400" /><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("receiving.warehouse")}</p><p className="mt-1 truncate font-semibold text-white">{warehouseName || t("receiving.selectPurchaseOrder")}</p></div></div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start gap-3"><div className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><ClipboardCheck className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">1</p><h2 className="mt-1 text-xl font-bold text-slate-900">{t("receiving.selectPurchaseOrder")}</h2><p className="mt-1 text-sm text-slate-500">{t("receiving.selectPurchaseOrder")}</p></div></div>
          <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={purchaseOrderId} onChange={(event) => { setPurchaseOrderId(event.target.value); setPurchaseOrderItemId(""); setQuantity(0); setMessage(""); }}>
            <option value="">{t("receiving.selectPurchaseOrder")}</option>
            {receivableOrders.map((order) => <option key={order.id} value={order.id}>{order.orderNumber} — {order.status === "APPROVED" ? t("purchasing.approved") : t("purchasing.partiallyReceived")}</option>)}
          </select>
          {selectedOrder && <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("receiving.supplier")}</p><p className="mt-1 font-semibold text-slate-900">{supplierName}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("receiving.warehouse")}</p><p className="mt-1 font-semibold text-slate-900">{warehouseName}</p></div></div>}
        </section>

        <section className={`rounded-2xl border bg-white p-5 shadow-sm sm:p-6 ${selectedOrder ? "border-blue-200" : "border-slate-200"}`}>
          <div className="mb-5 flex items-start gap-3"><div className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><Package className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">2</p><h2 className="mt-1 text-xl font-bold text-slate-900">{t("receiving.selectItem")}</h2><p className="mt-1 text-sm text-slate-500">{t("receiving.receivedProducts")}</p></div></div>
          <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400" value={purchaseOrderItemId} onChange={(event) => { setPurchaseOrderItemId(event.target.value); setQuantity(0); setMessage(""); }} disabled={!selectedOrder}>
            <option value="">{t("receiving.selectItem")}</option>
            {receivableItems.map((item) => { const remaining = item.quantity - item.receivedQuantity; return <option key={item.id} value={item.id}>{productNames[item.productId] ?? t("common.loading")} — {t("receiving.remainingQuantity")}: {remaining} — {t("receiving.unitCost")}: {item.unitCost}</option>; })}
          </select>
          {selectedItem && <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-blue-700">{t("receiving.remainingQuantity")}</p><p className="mt-1 text-2xl font-bold text-slate-900">{remainingQuantity}</p><p className="mt-1 text-xs text-slate-500">{t("receiving.receivedQuantity")}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("receiving.unitCost")}</p><p className="mt-1 text-2xl font-bold text-slate-900">{selectedItem.unitCost}</p><p className="mt-1 text-xs text-slate-500">{t("receiving.unitCost")}</p></div></div>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-blue-600">3</p><h2 className="mt-1 text-xl font-bold text-slate-900">{t("receiving.quantityToReceive")}</h2><p className="mt-1 text-sm text-slate-500">{t("receiving.quantityToReceive")}</p></div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end"><div className="flex-1"><label className="mb-2 block text-sm font-semibold text-slate-700">{t("receiving.quantityToReceive")}</label><input className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400" type="number" min="1" max={selectedItem ? remainingQuantity : undefined} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} disabled={!selectedItem} /></div><button type="button" onClick={handleSubmit} disabled={!selectedItem || quantity <= 0} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500">{t("receiving.createGoodsReceipt")}<ArrowRight className="h-4 w-4" /></button></div>
        </section>

        {message && <div className={`flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${message.includes(t("receiving.inventoryUpdated")) ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>{message.includes(t("receiving.inventoryUpdated")) ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}<p className="text-sm font-medium leading-6">{message}</p></div>}
      </div>
    </div>
  );
}

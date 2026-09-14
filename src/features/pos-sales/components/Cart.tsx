import { Minus, Plus, Trash2 } from "lucide-react";
import { usePosSalesStore } from "../store/pos-sales.store";

function formatMoney(value: number): string { return value.toFixed(2); }

export function Cart() {
  const items = usePosSalesStore((state) => state.items);
  const updateItem = usePosSalesStore((state) => state.updateItem);
  const removeItem = usePosSalesStore((state) => state.removeItem);
  const subtotal = usePosSalesStore((state) => state.getSubtotal());
  const discount = usePosSalesStore((state) => state.getDiscountAmount());
  const tax = usePosSalesStore((state) => state.getTaxAmount());
  const total = usePosSalesStore((state) => state.getTotal());

  function decreaseQuantity(itemId: string, quantity: number) {
    if (quantity <= 1) { removeItem(itemId); return; }
    updateItem(itemId, { quantity: quantity - 1 });
  }
  function increaseQuantity(itemId: string, quantity: number) {
    updateItem(itemId, { quantity: quantity + 1 });
  }

  return (
    <div className="min-w-0">
      <h2 className="font-medium">Cart</h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 && <p className="text-gray-600">Cart is empty.</p>}
        {items.map((item) => (
          <div key={item.id} className="min-w-0 rounded border p-3">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="break-words font-medium">{item.productName ?? "Product"}</p>
                <p className="text-sm text-gray-600">{formatMoney(item.unitPrice)} each</p>
              </div>
              <button type="button" aria-label={`Remove ${item.productName ?? "product"}`} className="shrink-0 rounded p-1 text-red-600 hover:bg-red-50" onClick={() => removeItem(item.id)}>
                <Trash2 size={18} />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex shrink-0 items-center rounded border">
                <button type="button" aria-label="Decrease quantity" className="p-2 hover:bg-gray-50" onClick={() => decreaseQuantity(item.id, item.quantity)}><Minus size={16} /></button>
                <span className="min-w-10 text-center text-sm font-medium">{item.quantity}</span>
                <button type="button" aria-label="Increase quantity" className="p-2 hover:bg-gray-50" onClick={() => increaseQuantity(item.id, item.quantity)}><Plus size={16} /></button>
              </div>
              <p className="whitespace-nowrap font-medium">{formatMoney(item.lineTotal)}</p>
            </div>
            {item.discountAmount > 0 && <p className="mt-2 text-sm text-gray-600">Discount: -{formatMoney(item.discountAmount)}</p>}
          </div>
        ))}
      </div>
      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between gap-4"><span>Subtotal</span><span className="whitespace-nowrap">{formatMoney(subtotal)}</span></div>
        {discount > 0 && <div className="mt-1 flex justify-between gap-4 text-sm text-gray-600"><span>Discount</span><span className="whitespace-nowrap">-{formatMoney(discount)}</span></div>}
        <div className="mt-1 flex justify-between gap-4"><span>Tax</span><span className="whitespace-nowrap">{formatMoney(tax)}</span></div>
        <div className="mt-2 flex justify-between gap-4 border-t pt-2 text-lg font-semibold"><span>Total</span><span className="whitespace-nowrap">{formatMoney(total)}</span></div>
      </div>
    </div>
  );
}

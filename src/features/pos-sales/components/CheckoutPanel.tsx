import {
  useMemo,
  useState,
} from "react";

import {
  usePosSalesStore,
} from "../store/pos-sales.store";

import {
  useSalesOrders,
} from "@/features/sales/hooks/useSalesOrders";

import {
  paymentService,
} from "@/features/payments/services";

import type {
  Payment,
  PaymentMethod,
} from "@/features/payments/types/payment.types";

import type {
  SalesOrder,
} from "@/features/sales/types/sales-order.types";


function roundMoney(
  value: number,
): number {
  return Math.round(
    (value + Number.EPSILON) * 100,
  ) / 100;
}


function formatMoney(
  value: number,
): string {
  return value.toFixed(2);
}


const paymentMethods: {
  value: PaymentMethod;
  label: string;
}[] = [
  {
    value: "CASH",
    label: "Cash",
  },
  {
    value: "CARD",
    label: "Card",
  },
  {
    value: "QR",
    label: "QR",
  },
  {
    value: "MOBILE_MONEY",
    label: "Mobile Money",
  },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
  },
];


interface CheckoutPanelProps {
  onSaleCompleted?: (
    order: SalesOrder,
    payment: Payment,
    cashReceived?: number,
  ) => void;
}


export function CheckoutPanel({
  onSaleCompleted,
}: CheckoutPanelProps) {

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    isProcessing,
    setIsProcessing,
  ] = useState(false);

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<PaymentMethod>(
    "CASH",
  );

  const [
    paymentProvider,
    setPaymentProvider,
  ] = useState("");

  const [
    paymentReference,
    setPaymentReference,
  ] = useState("");

  const [
    cashReceived,
    setCashReceived,
  ] = useState("");


  const items =
    usePosSalesStore(
      (state) =>
        state.items,
    );

  const tenantId =
    usePosSalesStore(
      (state) =>
        state.tenantId,
    );

  const storeId =
    usePosSalesStore(
      (state) =>
        state.storeId,
    );

  const warehouseId =
    usePosSalesStore(
      (state) =>
        state.warehouseId,
    );

  const clearCart =
    usePosSalesStore(
      (state) =>
        state.clearCart,
    );


  const subtotal =
    usePosSalesStore(
      (state) =>
        state.getSubtotal(),
    );

  const discount =
    usePosSalesStore(
      (state) =>
        state.getDiscountAmount(),
    );

  const tax =
    usePosSalesStore(
      (state) =>
        state.getTaxAmount(),
    );

  const total =
    usePosSalesStore(
      (state) =>
        state.getTotal(),
    );


  const {
    createDraft,
    addItem,
    confirmOrder,
    processOrder,
    completeOrder,
  } = useSalesOrders();


  const receivedAmount =
    roundMoney(
      Number(
        cashReceived || 0,
      ),
    );


  const change =
    roundMoney(
      Math.max(
        0,
        receivedAmount -
          total,
      ),
    );


  const paymentAmount =
    total;


  const cashIsSufficient =
    paymentMethod !== "CASH" ||
    receivedAmount >= total;


  const providerPlaceholder =
    useMemo(() => {

      switch (
        paymentMethod
      ) {

        case "QR":
          return "e.g. PromptPay";

        case "MOBILE_MONEY":
          return "e.g. M-Pesa";

        case "CARD":
          return "e.g. Visa";

        case "BANK_TRANSFER":
          return "e.g. KBank";

        default:
          return "";

      }

    }, [
      paymentMethod,
    ]);


  const requiresProvider =
    paymentMethod !==
    "CASH";


  function resetPaymentFields() {

    setCashReceived("");

    setPaymentProvider("");

    setPaymentReference("");

  }


  async function completeSale() {

    if (isProcessing) {
      return;
    }

    setMessage("");


    try {

      if (items.length === 0) {
        throw new Error(
          "Cart is empty.",
        );
      }


      if (!tenantId) {
        throw new Error(
          "Tenant is required.",
        );
      }


      if (!storeId) {
        throw new Error(
          "Store is required.",
        );
      }


      if (!warehouseId) {
        throw new Error(
          "Warehouse is required.",
        );
      }


      if (
        paymentMethod === "CASH" &&
        receivedAmount < total
      ) {

        throw new Error(
          "Cash received is less than the sale total.",
        );

      }


      if (
        requiresProvider &&
        !paymentProvider.trim()
      ) {

        throw new Error(
          "Payment provider is required.",
        );

      }


      setIsProcessing(true);


      let order =
        await createDraft({
          tenantId,
          storeId,
          warehouseId,
        });


      for (const item of items) {

        order =
          await addItem(
            order.id,
            {
              productId:
                item.productId,

              quantity:
                item.quantity,

              unitPrice:
                item.unitPrice,

              discountAmount:
                item.discountAmount,

              taxRate:
                item.taxRate,
            },
          );

      }


      order =
        await confirmOrder(
          order.id,
        );


      order =
        await processOrder(
          order.id,
        );


      const payment =
        await paymentService.createPayment(
          tenantId,
          order.id,
          paymentMethod,
          paymentAmount,
          paymentProvider.trim() ||
            undefined,
        );


      const completedPayment =
        await paymentService.completePayment(
          tenantId,
          payment.id,
          paymentReference.trim() ||
            undefined,
        );


      if (!completedPayment) {

        throw new Error(
          "Payment could not be completed.",
        );

      }


      order =
        await completeOrder(
          order.id,
        );


      if (
        order.status !==
        "COMPLETED"
      ) {

        throw new Error(
          "Sale could not be completed.",
        );

      }


      onSaleCompleted?.(
        order,
        completedPayment,
        paymentMethod === "CASH"
          ? receivedAmount
          : undefined,
      );


      clearCart();

      resetPaymentFields();


      setMessage(
        paymentMethod === "CASH"
          ? `Sale completed successfully. Change: ${formatMoney(change)}`
          : "Sale completed successfully.",
      );


    } catch (error) {

      console.error(
        "POS sale failed:",
        error,
      );


      setMessage(
        error instanceof Error
          ? error.message
          : "Sale failed.",
      );


    } finally {

      setIsProcessing(false);

    }

  }


  return (

    <div className="rounded border p-4">

      <h2 className="font-medium">
        Checkout
      </h2>


      <div className="mt-4 space-y-2">

        <div className="flex justify-between">

          <span>
            Subtotal
          </span>

          <span>
            {formatMoney(
              subtotal,
            )}
          </span>

        </div>


        {discount > 0 && (

          <div className="flex justify-between text-sm text-gray-600">

            <span>
              Discount
            </span>

            <span>
              -
              {formatMoney(
                discount,
              )}
            </span>

          </div>

        )}


        <div className="flex justify-between">

          <span>
            Tax
          </span>

          <span>
            {formatMoney(
              tax,
            )}
          </span>

        </div>


        <div className="flex justify-between border-t pt-2 text-lg font-semibold">

          <span>
            Total
          </span>

          <span>
            {formatMoney(
              total,
            )}
          </span>

        </div>

      </div>


      <div className="mt-5">

        <label className="block text-sm font-medium">
          Payment method
        </label>


        <select
          value={paymentMethod}
          disabled={
            isProcessing ||
            items.length === 0
          }
          onChange={(event) => {

            setPaymentMethod(
              event.target.value as PaymentMethod,
            );

            setCashReceived("");

            setPaymentProvider("");

            setPaymentReference("");

          }}
          className="mt-1 w-full rounded border px-3 py-2"
        >

          {paymentMethods.map(
            (method) => (

              <option
                key={method.value}
                value={method.value}
              >
                {method.label}
              </option>

            ),
          )}

        </select>

      </div>


      {paymentMethod ===
        "CASH" && (

        <>

          <div className="mt-4">

            <label
              htmlFor="cash-received"
              className="block text-sm font-medium"
            >
              Cash received
            </label>


            <input
              id="cash-received"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={cashReceived}
              disabled={
                isProcessing ||
                items.length === 0
              }
              onChange={(event) =>
                setCashReceived(
                  event.target.value,
                )
              }
              placeholder="Enter amount"
              className="mt-1 w-full rounded border px-3 py-2 outline-none focus:ring-2"
            />

          </div>


          <div className="mt-3 rounded bg-gray-50 p-3">

            <div className="flex justify-between">

              <span>
                Change
              </span>

              <span className="font-semibold">
                {formatMoney(
                  change,
                )}
              </span>

            </div>

          </div>

        </>

      )}


      {paymentMethod !==
        "CASH" && (

        <div className="mt-4 space-y-3">

          <div>

            <label
              htmlFor="payment-provider"
              className="block text-sm font-medium"
            >
              Provider
            </label>


            <input
              id="payment-provider"
              type="text"
              value={paymentProvider}
              disabled={
                isProcessing ||
                items.length === 0
              }
              onChange={(event) =>
                setPaymentProvider(
                  event.target.value,
                )
              }
              placeholder={
                providerPlaceholder
              }
              className="mt-1 w-full rounded border px-3 py-2"
            />

          </div>


          <div>

            <label
              htmlFor="payment-reference"
              className="block text-sm font-medium"
            >
              Reference
              <span className="font-normal text-gray-500">
                {" "}
                (optional)
              </span>
            </label>


            <input
              id="payment-reference"
              type="text"
              value={paymentReference}
              disabled={
                isProcessing ||
                items.length === 0
              }
              onChange={(event) =>
                setPaymentReference(
                  event.target.value,
                )
              }
              placeholder="Transaction reference"
              className="mt-1 w-full rounded border px-3 py-2"
            />

          </div>

        </div>

      )}


      {!cashIsSufficient &&
        paymentMethod === "CASH" &&
        items.length > 0 &&
        cashReceived !== "" && (

          <p className="mt-3 text-sm text-red-600">

            Cash received must be at least{" "}

            {formatMoney(
              total,
            )}

            .

          </p>

        )}


      <button
        type="button"
        disabled={
          items.length === 0 ||
          isProcessing ||
          !cashIsSufficient ||
          (
            requiresProvider &&
            !paymentProvider.trim()
          )
        }
        className="mt-4 w-full rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => {
          void completeSale();
        }}
      >

        {isProcessing
          ? "Processing sale..."
          : "Complete Sale"}

      </button>


      {message && (

        <p className="mt-4 text-sm">
          {message}
        </p>

      )}

    </div>

  );

}

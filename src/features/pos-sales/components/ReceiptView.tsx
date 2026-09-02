import {
  useEffect,
} from "react";

import type {
  Product,
} from "@/features/products/types/product.types";

import type {
  Receipt,
} from "../engine";


function formatMoney(
  value: number,
): string {
  return Number(value ?? 0).toFixed(2);
}


function formatDate(
  value: string,
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString();
}


function formatPaymentMethod(
  method?: Receipt["paymentMethod"],
): string {
  switch (method) {
    case "CASH":
      return "Cash";

    case "CARD":
      return "Card";

    case "QR":
      return "QR";

    case "MOBILE_MONEY":
      return "Mobile Money";

    case "BANK_TRANSFER":
      return "Bank Transfer";

    default:
      return "Unknown";
  }
}


interface ReceiptProps {
  receipt: Receipt;
  products: Product[];
}


export function ReceiptView({
  receipt,
  products,
}: ReceiptProps) {

  useEffect(() => {
    return () => {
      const style =
        document.getElementById(
          "pos-receipt-print-style",
        );

      style?.remove();
    };
  }, []);


  function getProductName(
    productId: string,
  ): string {
    const product =
      products.find(
        (item) =>
          item.id === productId,
      );

    return (
      product?.name ??
      `Product ${productId}`
    );
  }


  function printReceipt() {

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=420,height=700",
      );

    if (!printWindow) {
      return;
    }


    const itemsHtml =
      receipt.items
        .map(
          (item) => `
            <tr>
              <td>
                ${getProductName(item.productId)}
              </td>

              <td style="text-align:center;">
                ${item.quantity}
              </td>

              <td style="text-align:right;">
                ${formatMoney(item.unitPrice)}
              </td>

              <td style="text-align:right;">
                ${formatMoney(item.lineTotal)}
              </td>
            </tr>
          `,
        )
        .join("");


    const discountHtml =
      receipt.discountAmount > 0
        ? `
          <div class="row">
            <span>Discount</span>
            <span>-${formatMoney(receipt.discountAmount)}</span>
          </div>
        `
        : "";


    const cashHtml =
      receipt.cashReceived !== undefined
        ? `
          <div class="row">
            <span>Cash Received</span>
            <span>${formatMoney(receipt.cashReceived)}</span>
          </div>

          <div class="row">
            <span>Change</span>
            <span>${formatMoney(receipt.changeAmount ?? 0)}</span>
          </div>
        `
        : "";


    const providerHtml =
      receipt.paymentProvider
        ? `
          <div class="row">
            <span>Provider</span>
            <span>${receipt.paymentProvider}</span>
          </div>
        `
        : "";


    const referenceHtml =
      receipt.paymentReference
        ? `
          <div class="row">
            <span>Reference</span>
            <span>${receipt.paymentReference}</span>
          </div>
        `
        : "";


    printWindow.document.write(
      `
        <!DOCTYPE html>

        <html>

          <head>

            <title>${receipt.saleNumber}</title>

            <style>

              body {
                font-family: Arial, sans-serif;
                width: 80mm;
                margin: 0 auto;
                padding: 12px;
                font-size: 12px;
              }

              h1 {
                text-align: center;
                font-size: 18px;
                margin: 0 0 8px;
              }

              .center {
                text-align: center;
              }

              .divider {
                border-top: 1px dashed #000;
                margin: 10px 0;
              }

              table {
                width: 100%;
                border-collapse: collapse;
              }

              th,
              td {
                padding: 4px 0;
                vertical-align: top;
              }

              th {
                border-bottom: 1px solid #000;
              }

              .row {
                display: flex;
                justify-content: space-between;
                gap: 12px;
                margin-top: 5px;
              }

              .total {
                font-size: 15px;
                font-weight: bold;
                border-top: 1px solid #000;
                padding-top: 7px;
                margin-top: 7px;
              }

              .payment {
                border-top: 1px dashed #000;
                border-bottom: 1px dashed #000;
                padding: 8px 0;
                margin-top: 10px;
              }

              .footer {
                text-align: center;
                margin-top: 16px;
              }

              @media print {
                body {
                  margin: 0;
                }
              }

            </style>

          </head>


          <body>

            <h1>SALES RECEIPT</h1>

            <div class="center">
              ${receipt.saleNumber}
            </div>

            <div class="center">
              ${formatDate(receipt.createdAt)}
            </div>

            <div class="divider"></div>


            <table>

              <thead>

                <tr>

                  <th style="text-align:left;">
                    Item
                  </th>

                  <th>
                    Qty
                  </th>

                  <th style="text-align:right;">
                    Price
                  </th>

                  <th style="text-align:right;">
                    Total
                  </th>

                </tr>

              </thead>


              <tbody>
                ${itemsHtml}
              </tbody>

            </table>


            <div class="divider"></div>


            <div class="row">
              <span>Subtotal</span>
              <span>${formatMoney(receipt.subtotal)}</span>
            </div>

            ${discountHtml}

            <div class="row">
              <span>Tax</span>
              <span>${formatMoney(receipt.taxAmount)}</span>
            </div>


            <div class="row total">
              <span>Total</span>
              <span>${formatMoney(receipt.totalAmount)}</span>
            </div>


            <div class="payment">

              <div class="row">
                <span>Payment Method</span>
                <span>
                  ${formatPaymentMethod(
                    receipt.paymentMethod,
                  )}
                </span>
              </div>

              ${
                receipt.paymentAmount !== undefined
                  ? `
                    <div class="row">
                      <span>Amount Paid</span>
                      <span>
                        ${formatMoney(
                          receipt.paymentAmount,
                        )}
                      </span>
                    </div>
                  `
                  : ""
              }

              ${cashHtml}

              ${providerHtml}

              ${referenceHtml}

            </div>


            <div class="footer">
              Thank you for your purchase!
            </div>

          </body>

        </html>
      `,
    );


    printWindow.document.close();

    printWindow.focus();

    printWindow.onafterprint = () => {
      printWindow.close();
    };

    printWindow.print();
  }


  return (

    <div className="rounded border p-4">

      <div className="flex items-center justify-between gap-4">

        <div>

          <h2 className="font-medium">
            Receipt
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            {receipt.saleNumber}
          </p>

        </div>


        <button
          type="button"
          onClick={printReceipt}
          className="rounded border px-3 py-2 text-sm"
        >
          Print Receipt
        </button>

      </div>


      <div className="mt-4 rounded bg-white p-4">

        <div className="text-center">

          <h3 className="text-lg font-semibold">
            SALES RECEIPT
          </h3>

          <p className="mt-1 text-sm">
            {receipt.saleNumber}
          </p>

          <p className="text-sm text-gray-600">
            {formatDate(
              receipt.createdAt,
            )}
          </p>

        </div>


        <div className="mt-4 border-t pt-3">

          <div className="space-y-3">

            {receipt.items.map(
              (item) => (

                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 text-sm"
                >

                  <div>

                    <p className="font-medium">
                      {getProductName(
                        item.productId,
                      )}
                    </p>

                    <p className="text-gray-600">
                      {item.quantity} ×{" "}
                      {formatMoney(
                        item.unitPrice,
                      )}
                    </p>

                  </div>


                  <span className="font-medium">
                    {formatMoney(
                      item.lineTotal,
                    )}
                  </span>

                </div>

              ),
            )}

          </div>

        </div>


        <div className="mt-4 border-t pt-3 text-sm">

          <div className="flex justify-between">
            <span>Subtotal</span>

            <span>
              {formatMoney(
                receipt.subtotal,
              )}
            </span>
          </div>


          {receipt.discountAmount > 0 && (

            <div className="mt-1 flex justify-between">

              <span>
                Discount
              </span>

              <span>
                -{formatMoney(
                  receipt.discountAmount,
                )}
              </span>

            </div>

          )}


          <div className="mt-1 flex justify-between">

            <span>
              Tax
            </span>

            <span>
              {formatMoney(
                receipt.taxAmount,
              )}
            </span>

          </div>


          <div className="mt-2 flex justify-between border-t pt-2 text-base font-semibold">

            <span>
              Total
            </span>

            <span>
              {formatMoney(
                receipt.totalAmount,
              )}
            </span>

          </div>


          <div className="mt-4 rounded border p-3">

            <p className="mb-2 font-semibold">
              Payment
            </p>


            <div className="flex justify-between">
              <span>
                Method
              </span>

              <span className="font-medium">
                {formatPaymentMethod(
                  receipt.paymentMethod,
                )}
              </span>
            </div>


            {receipt.paymentAmount !== undefined && (

              <div className="mt-1 flex justify-between">

                <span>
                  Amount Paid
                </span>

                <span>
                  {formatMoney(
                    receipt.paymentAmount,
                  )}
                </span>

              </div>

            )}


            {receipt.cashReceived !== undefined && (

              <>
                <div className="mt-1 flex justify-between">

                  <span>
                    Cash Received
                  </span>

                  <span>
                    {formatMoney(
                      receipt.cashReceived,
                    )}
                  </span>

                </div>


                <div className="mt-1 flex justify-between font-semibold">

                  <span>
                    Change
                  </span>

                  <span>
                    {formatMoney(
                      receipt.changeAmount ?? 0,
                    )}
                  </span>

                </div>
              </>

            )}


            {receipt.paymentProvider && (

              <div className="mt-1 flex justify-between gap-4">

                <span>
                  Provider
                </span>

                <span className="text-right">
                  {receipt.paymentProvider}
                </span>

              </div>

            )}


            {receipt.paymentReference && (

              <div className="mt-1 flex justify-between gap-4">

                <span>
                  Reference
                </span>

                <span className="break-all text-right">
                  {receipt.paymentReference}
                </span>

              </div>

            )}

          </div>

        </div>


        <p className="mt-5 text-center text-sm text-gray-600">
          Thank you for your purchase!
        </p>

      </div>

    </div>

  );
}

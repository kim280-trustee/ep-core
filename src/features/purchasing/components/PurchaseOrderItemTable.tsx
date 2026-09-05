import {
  useEffect,
  useState,
} from "react";

import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";

import {
  productService,
} from "@/features/products/services/product.service";


interface PurchaseOrderItemTableProps {

  items: PurchaseOrderItem[];

  tenantId: string;

}


export function PurchaseOrderItemTable({

  items,

  tenantId,

}: PurchaseOrderItemTableProps) {

  const [
    productNames,
    setProductNames,
  ] = useState<Record<string, string>>({});


  useEffect(() => {

    let cancelled = false;


    async function loadProductNames() {

      if (
        !tenantId ||
        items.length === 0
      ) {

        setProductNames({});

        return;

      }


      const uniqueProductIds = [
        ...new Set(
          items.map(
            item => item.productId,
          ),
        ),
      ];


      const results =
        await Promise.all(
          uniqueProductIds.map(
            async (productId) => {

              try {

                const product =
                  await productService.getProductById(
                    tenantId,
                    productId,
                  );


                return [
                  productId,
                  product
                    ? `${product.name} — SKU: ${product.sku}`
                    : productId,
                ] as const;

              } catch {

                return [
                  productId,
                  productId,
                ] as const;

              }

            },
          ),
        );


      if (cancelled) {
        return;
      }


      setProductNames(
        Object.fromEntries(
          results,
        ),
      );

    }


    void loadProductNames();


    return () => {

      cancelled = true;

    };

  }, [
    items,
    tenantId,
  ]);


  if (items.length === 0) {

    return (

      <p>
        No purchase order items.
      </p>

    );

  }


  return (

    <table>

      <thead>

        <tr>

          <th>
            Product
          </th>

          <th>
            Ordered
          </th>

          <th>
            Received
          </th>

          <th>
            Unit Cost
          </th>

          <th>
            Tax %
          </th>

          <th>
            Line Total
          </th>

        </tr>

      </thead>


      <tbody>

        {items.map((item) => (

          <tr
            key={item.id}
          >

            <td>
              {productNames[item.productId] ??
                "Loading product..."}
            </td>

            <td>
              {item.quantity}
            </td>

            <td>
              {item.receivedQuantity}
            </td>

            <td>
              {item.unitCost}
            </td>

            <td>
              {item.taxRate}
            </td>

            <td>
              {item.lineTotal}
            </td>

          </tr>

        ))}

      </tbody>

    </table>

  );

}

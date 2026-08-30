import {
  useEffect,
  useState,
} from "react";

import {
  ProductSearch,
} from "../components/ProductSearch";

import {
  Cart,
} from "../components/Cart";

import {
  CheckoutPanel,
} from "../components/CheckoutPanel";

import {
  productService,
} from "../../products/services/product.service";

import type {
  Product,
} from "../../products/types/product.types";

import {
  storeContext,
} from "@/core/store/store.context";

import {
  warehouseRepository,
} from "@/features/warehouses/repositories";

import type {
  Warehouse,
} from "@/features/warehouses/types/warehouse.types";

import {
  usePosSalesStore,
} from "../store/pos-sales.store";


export function PosSalesPage() {

  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

  const [
    warehouses,
    setWarehouses,
  ] = useState<Warehouse[]>([]);

  const [
    warehouseId,
    setWarehouseId,
  ] = useState("");

  const context =
    storeContext.getStore();

  const setContext =
    usePosSalesStore(
      (state) =>
        state.setContext,
    );


  useEffect(() => {

    if (
      !context?.tenantId ||
      !context.storeId
    ) {
      return;
    }

    setContext({
      tenantId:
        context.tenantId,

      storeId:
        context.storeId,
    });

  }, [
    context?.tenantId,
    context?.storeId,
    setContext,
  ]);


  useEffect(() => {

    async function loadData() {

      if (
        !context?.tenantId ||
        !context.storeId
      ) {
        return;
      }

      try {

        const result =
          await productService.getProducts(
            context.tenantId,
          );

        setProducts(
          result.data,
        );


        const available =
          (
            await warehouseRepository.findAll()
          ).filter(
            (warehouse) =>
              warehouse.tenantId ===
                context.tenantId &&
              warehouse.storeId ===
                context.storeId,
          );

        setWarehouses(
          available,
        );


        const firstWarehouse =
          available[0];

        if (firstWarehouse) {

          setWarehouseId(
            firstWarehouse.id,
          );

          setContext({
            warehouseId:
              firstWarehouse.id,
          });

        }

      } catch (error) {

        console.error(
          "Failed to load POS data:",
          error,
        );

      }

    }


    void loadData();

  }, [
    context?.tenantId,
    context?.storeId,
    setContext,
  ]);


  function handleWarehouseChange(
    value: string,
  ) {

    setWarehouseId(
      value,
    );

    setContext({
      warehouseId:
        value,
    });

  }


  return (

    <div className="p-6">

      <h1 className="text-2xl font-semibold">
        POS Sales
      </h1>


      <div className="mt-4 rounded border p-4">

        <label className="mb-1 block text-sm font-medium">
          Warehouse
        </label>

        <select
          value={warehouseId}
          onChange={(event) =>
            handleWarehouseChange(
              event.target.value,
            )
          }
          className="w-full rounded border p-2"
        >

          <option value="">
            Select warehouse
          </option>

          {warehouses.map(
            (warehouse) => (

              <option
                key={warehouse.id}
                value={warehouse.id}
              >
                {warehouse.name}
              </option>

            ),
          )}

        </select>

      </div>


      <div className="mt-6 grid grid-cols-2 gap-6">

        <div className="rounded border p-4">

          <h2 className="mb-4 font-medium">
            Products
          </h2>

          <ProductSearch products={products} />

        </div>


        <div className="rounded border p-4">

          <Cart />

        </div>

      </div>


      <div className="mt-6">

        <CheckoutPanel />

      </div>

    </div>

  );

}



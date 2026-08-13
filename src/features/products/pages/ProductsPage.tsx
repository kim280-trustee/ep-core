/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Products Page
 * ============================================================
 */

import {
  useMemo,
} from "react";


import {
  ProductToolbar,
} from "../components/ProductToolbar";


import {
  ProductTable,
} from "../components/ProductTable";


import {
  ProductForm,
} from "../components/ProductForm";


import {
  useProducts,
} from "../hooks/useProduct";


import {
  useCreateProduct,
} from "../hooks/useProductMutations";


import {
  useProductStore,
} from "../store/products.store";


import {
  useAuth,
} from "@/core/auth";


import type {
  CreateProductInput,
} from "../types/product.types";


import type {
  ProductFormValues,
} from "../schemas/product.schema";



export function ProductsPage() {


  const {
    user,
  } =
    useAuth();



  const tenantId =
    user?.tenantId ?? "";



  const {
    filters,
    updateFilters,
  } =
    useProductStore();



  const {
    data,
    isLoading,
  } =
    useProducts({

      tenantId,

      filters,

    });



  const createProduct =
    useCreateProduct(
      tenantId,
    );



  const products =
    useMemo(
      () =>
        data?.data ?? [],
      [
        data,
      ],
    );



  async function handleCreate(
    values: ProductFormValues,
  ) {


    const input:
      CreateProductInput =
    {

      tenantId,


      name:
        values.name,


      sku:
        values.sku,


      currency:
        values.currency,


      productType:
        values.productType,


      status:
        values.status,


      costPrice:
        values.costPrice,


      sellingPrice:
        values.sellingPrice,


      trackInventory:
        values.trackInventory,


      barcode:
        values.barcode ?? undefined,


      description:
        values.description ?? undefined,


      categoryId:
        values.categoryId ?? undefined,


      brandId:
        values.brandId ?? undefined,


      unitId:
        values.unitId ?? undefined,


      taxId:
        values.taxId ?? undefined,


      imageUrl:
        values.imageUrl ?? undefined,


    };


    await createProduct.mutateAsync(
      input,
    );


  }



  if (!tenantId) {

    return (

      <div>

        Loading tenant...

      </div>

    );

  }



  return (

    <div className="space-y-6">


      <ProductToolbar

        filters={
          filters
        }

        updateFilters={
          updateFilters
        }

      />



      <ProductForm

        onSubmit={
          handleCreate
        }

        loading={
          createProduct.isPending
        }

      />



      <ProductTable

        products={
          products
        }

        loading={
          isLoading
        }

      />


    </div>

  );

}
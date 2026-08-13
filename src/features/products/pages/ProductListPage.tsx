/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product List Page
 * ============================================================
 */

import {
  ProductTable,
} from "../components/ProductTable";


import {
  useProducts,
} from "../hooks/useProducts";


interface ProductListPageProps {

  tenantId: string;

}



export function ProductListPage({
  tenantId,
}: ProductListPageProps) {


  const {
    data,
    isLoading,
  } =
  useProducts({
    tenantId,
  });



  const products =
    data?.data ?? [];



  return (

    <ProductTable

      products={products}

      loading={isLoading}

    />

  );

}
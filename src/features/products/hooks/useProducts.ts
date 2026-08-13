import { useQuery } from "@tanstack/react-query";

import { productKeys } from "../queries/product.keys";
import { productService } from "../services/product.service";

import type {
  ProductFilters,
} from "../types/product.types";

interface UseProductsOptions {
  tenantId: string;
  filters?: ProductFilters;
}

export function useProducts({
  tenantId,
  filters,
}: UseProductsOptions) {
  return useQuery({
    queryKey: productKeys.list(
      tenantId,
      filters,
    ),

    queryFn: () =>
      productService.getProducts(
        tenantId,
        filters,
      ),

    enabled: !!tenantId,
  });
}
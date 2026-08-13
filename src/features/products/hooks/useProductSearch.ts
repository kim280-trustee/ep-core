import { useQuery } from "@tanstack/react-query";

import { productKeys } from "../queries/product.keys";
import { productService } from "../services/product.service";

export function useProductSearch(
  tenantId: string,
  search: string,
) {
  const keyword =
    search.trim();

  return useQuery({
    queryKey:
      productKeys.search(
        tenantId,
        keyword,
      ),

    queryFn: () =>
      productService.searchProducts(
        tenantId,
        keyword,
      ),

    enabled:
      Boolean(tenantId) &&
      keyword.length > 0,

    staleTime:
      1000 * 60,

    gcTime:
      1000 * 60 * 10,

    refetchOnWindowFocus:
      false,
  });
}
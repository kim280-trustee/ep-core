/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Query Hook
 * ============================================================
 */

import { useQuery } from "@tanstack/react-query";

import { productKeys } from "../queries/product.keys";
import { productService } from "../services/product.service";

export function useProduct(
  tenantId: string,
  productId: string,
) {
  return useQuery({
    queryKey: productKeys.detail(
      tenantId,
      productId,
    ),

    queryFn: () =>
      productService.getProductById(
        tenantId,
        productId,
      ),

    enabled: Boolean(
      tenantId &&
      productId,
    ),
  });
}

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { productKeys } from "../queries/product.keys";
import { productService } from "../services/product.service";

import type {
  CreateProductInput,
  Product,
  ProductListResult,
  UpdateProductInput,
} from "../types/product.types";

export function useCreateProduct(
  tenantId: string,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input: CreateProductInput,
    ) =>
      productService.createProduct(
        input,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          productKeys.all(
            tenantId,
          ),
      });
    },
  });
}

export function useUpdateProduct(
  tenantId: string,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateProductInput;
    }) =>
      productService.updateProduct(
        tenantId,
        id,
        input,
      ),

    onSuccess: (
      product,
    ) => {
      queryClient.setQueryData(
        productKeys.detail(
          tenantId,
          product.id,
        ),
        product,
      );

      queryClient.invalidateQueries({
        queryKey:
          productKeys.all(
            tenantId,
          ),
      });
    },
  });
}

export function useDeleteProduct(
  tenantId: string,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: string,
    ) =>
      productService.deleteProduct(
        tenantId,
        id,
      ),

    onSuccess: (
      _,
      id,
    ) => {
      queryClient.removeQueries({
        queryKey:
          productKeys.detail(
            tenantId,
            id,
          ),
      });

      queryClient.setQueriesData(
        {
          queryKey:
            productKeys.all(
              tenantId,
            ),
        },
        (
          old:
            | ProductListResult
            | undefined,
        ) => {
          if (!old)
            return old;

          return {
            ...old,
            data:
              old.data.filter(
                (
                  product: Product,
                ) =>
                  product.id !==
                  id,
              ),
          };
        },
      );

      queryClient.invalidateQueries({
        queryKey:
          productKeys.all(
            tenantId,
          ),
      });
    },
  });
}
import {
  useEffect,
  useState,
} from "react";

import {
  productRepository,
} from "@/features/products/repositories";

import type {
  Product,
} from "@/features/products/types/product.types";

import {
  storeContext,
} from "@/core/store/store.context";

interface ProductSelectorProps {
  value: string;

  onChange:
    (value: string) => void;

  onPriceChange?:
    (value: string) => void;
}

export default function ProductSelector({
  value,
  onChange,
  onPriceChange,
}: ProductSelectorProps) {
  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      const context =
        storeContext.getStore();

      if (!context?.tenantId) {
        if (active) {
          setProducts([]);
        }

        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result =
          await productRepository.findAll(
            context.tenantId,
          );

        if (active) {
          setProducts(
            result.data,
          );
        }
      } catch (error) {
        console.error(
          "Failed to load products:",
          error,
        );

        if (active) {
          setProducts([]);
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load products.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(
    productId: string,
  ) {
    onChange(productId);

    const selectedProduct =
      products.find(
        (product) =>
          product.id === productId,
      );

    if (
      selectedProduct &&
      onPriceChange
    ) {
      onPriceChange(
        String(
          selectedProduct.sellingPrice,
        ),
      );
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        Product
      </label>

      <select
        value={value || ""}
        disabled={loading}
        onChange={(event) =>
          handleChange(
            event.target.value,
          )
        }
        className="w-full rounded border p-2"
      >
        <option value="">
          {loading
            ? "Loading products..."
            : "Select product"}
        </option>

        {products.map(
          (product) => (
            <option
              key={product.id}
              value={product.id}
            >
              {product.name}
              {" - "}
              {product.sellingPrice}
            </option>
          ),
        )}
      </select>

      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

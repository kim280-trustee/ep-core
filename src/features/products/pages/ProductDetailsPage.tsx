/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Details Page
 * ============================================================
 */

import { Link, useParams } from "react-router-dom";

import { useProduct } from "../hooks/useProduct";
import { ProductStatusBadge } from "../components/ProductStatusBadge";

import { useAuth } from "@/core/auth";

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const tenantId = user?.tenantId ?? "";
  const productId = id ?? "";

  const {
    data: product,
    isLoading,
    error,
  } = useProduct(
    tenantId,
    productId,
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Loading product...
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Please wait while the product is loaded.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Unable to load product
        </h1>

        <p className="mt-2 text-sm text-red-600">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Product not found
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          The requested product could not be found.
        </p>
      </div>
    );
  }

  const currency =
    product.pricing?.currency ?? "THB";

  const costPrice =
    Number(product.costPrice ?? 0);

  const sellingPrice =
    Number(product.sellingPrice ?? 0);

  const stockQuantity =
    Number(
      product.inventory?.stockQuantity ?? 0,
    );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between rounded-xl border bg-white p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {product.name}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            SKU: {product.sku}
          </p>
        </div>

        <div className="flex items-center gap-3">
  <div className="flex items-center gap-3">
  <ProductStatusBadge
    status={product.status}
  />

  <Link
    to={`/products/${product.id}/edit`}
    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
  >
    Edit Product
  </Link>
</div>

  
</div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Product Information
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">
              Name
            </p>

            <p className="mt-1 font-medium">
              {product.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              SKU
            </p>

            <p className="mt-1 font-medium">
              {product.sku}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Barcode
            </p>

            <p className="mt-1 font-medium">
              {product.barcode ?? "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Product Type
            </p>

            <p className="mt-1 font-medium">
              {product.productType}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Status
            </p>

            <p className="mt-1 font-medium">
              {product.status}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Currency
            </p>

            <p className="mt-1 font-medium">
              {currency}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Pricing
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">
              Cost Price
            </p>

            <p className="mt-1 text-xl font-semibold">
              {currency} {costPrice.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Selling Price
            </p>

            <p className="mt-1 text-xl font-semibold">
              {currency} {sellingPrice.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Inventory
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">
              Track Inventory
            </p>

            <p className="mt-1 font-medium">
              {product.trackInventory
                ? "Yes"
                : "No"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Stock Quantity
            </p>

            <p className="mt-1 font-medium">
              {stockQuantity}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Additional Information
        </h2>

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">
              Description
            </p>

            <p className="mt-1">
              {product.description || "-"}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Category
              </p>

              <p className="mt-1">
                {product.categoryId ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Brand
              </p>

              <p className="mt-1">
                {product.brandId ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Unit
              </p>

              <p className="mt-1">
                {product.unitId ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Tax
              </p>

              <p className="mt-1">
                {product.taxId ?? "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
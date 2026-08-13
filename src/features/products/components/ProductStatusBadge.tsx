import type { ProductStatus } from "../types/product.types";

interface ProductStatusBadgeProps {
  status: ProductStatus;
}

const STATUS_CLASSES: Record<ProductStatus, string> = {
  ACTIVE:
    "inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700",

  INACTIVE:
    "inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700",
};

export function ProductStatusBadge({
  status,
}: ProductStatusBadgeProps) {
  return (
    <span
      className={
        STATUS_CLASSES[
          status
        ]
      }
    >
      {status}
    </span>
  );
}
import { Package } from "lucide-react";

interface ProductEmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function ProductEmptyState({
  title = "No products found",
  description = "Create your first product to get started.",
  action,
}: ProductEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <Package
          size={36}
          className="text-gray-500"
        />
      </div>

      <h3 className="text-lg font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-gray-500">
        {description}
      </p>

      {action ? (
        <div className="mt-6">
          {action}
        </div>
      ) : null}
    </div>
  );
}
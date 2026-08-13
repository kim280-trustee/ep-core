/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Brands Module
 *
 * Production Brand Table
 * ============================================================
 */

import type {
  Brand,
} from "../types/brand.types";

interface BrandTableProps {
  brands: Brand[];

  onDelete: (
    id: string,
  ) => void;
}

export function BrandTable({
  brands,
  onDelete,
}: BrandTableProps) {

  if (brands.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="text-gray-500">
          No brands found.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse">

        <thead>
          <tr className="border-b bg-gray-50 text-left">

            <th className="px-4 py-3 font-semibold">
              Name
            </th>

            <th className="px-4 py-3 font-semibold">
              Description
            </th>

            <th className="px-4 py-3 font-semibold">
              Status
            </th>

            <th className="px-4 py-3 text-right font-semibold">
              Actions
            </th>

          </tr>
        </thead>

        <tbody>
          {brands.map((brand) => (
            <tr
              key={brand.id}
              className="border-b last:border-b-0"
            >

              <td className="px-4 py-3">
                {brand.name}
              </td>

              <td className="px-4 py-3">
                {brand.description || "—"}
              </td>

              <td className="px-4 py-3">
                <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium">
                  {String(brand.status)}
                </span>
              </td>

              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">

                  <button
                    type="button"
                    onClick={() => onDelete(brand.id)}
                    className="rounded border px-3 py-1 text-sm"
                  >
                    Delete
                  </button>

                </div>
              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

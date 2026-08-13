import { Link } from "react-router-dom";
import type { Product } from "../types/product.types";

interface ProductTableProps {
products: Product[];
loading?: boolean;
}

export function ProductTable({
products,
loading = false,
}: ProductTableProps) {
if (loading) {
return ( <div className="rounded-lg border bg-white p-8 text-center">
Loading products... </div>
);
}

return ( <div className="overflow-x-auto rounded-lg border bg-white"> <table className="w-full text-sm"> <thead className="border-b bg-gray-50"> <tr> <th className="px-4 py-3 text-left font-semibold">Name</th> <th className="px-4 py-3 text-left font-semibold">SKU</th> <th className="px-4 py-3 text-left font-semibold">Barcode</th> <th className="px-4 py-3 text-right font-semibold">Cost</th> <th className="px-4 py-3 text-right font-semibold">Selling</th> <th className="px-4 py-3 text-left font-semibold">Status</th> <th className="px-4 py-3 text-left font-semibold">Actions</th> </tr> </thead>

```
    <tbody>
      {products.length === 0 && (
        <tr>
          <td
            colSpan={7}
            className="px-4 py-8 text-center text-gray-500"
          >
            No products found.
          </td>
        </tr>
      )}

      {products.length > 0 &&
        products.map((product) => (
          <tr
            key={product.id}
            className="border-b hover:bg-gray-50"
          >
            <td className="px-4 py-3 font-medium">
              {product.name}
            </td>

            <td className="px-4 py-3">
              {product.sku}
            </td>

            <td className="px-4 py-3">
              {product.barcode || "-"}
            </td>

            <td className="px-4 py-3 text-right">
              {Number(product.costPrice || 0).toFixed(2)}
            </td>

            <td className="px-4 py-3 text-right">
              {Number(product.sellingPrice || 0).toFixed(2)}
            </td>

            <td className="px-4 py-3">
              {product.status}
            </td>

            <td className="px-4 py-3">
              <Link
                to={"/products/" + product.id}
                className="text-blue-600 hover:underline"
              >
                View
              </Link>
            </td>
          </tr>
        ))}
    </tbody>
  </table>
</div>


);
}

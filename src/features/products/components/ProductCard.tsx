import type {
  Product,
} from "../types/product.types";


interface ProductCardProps {
  product: Product;
}


export function ProductCard({
  product,
}: ProductCardProps) {

  return (
    <div
      className="
        rounded-lg
        border
        p-4
        bg-white
      "
    >

      <h3
        className="
          text-lg
          font-semibold
        "
      >
        {product.name}
      </h3>


      <p>
        SKU: {product.identifiers.sku}
      </p>


      <p>
        Price:
        {" "}
        {product.pricing.currency}
        {" "}
        {product.pricing.sellingPrice}
      </p>


      <p>
        Stock:
        {" "}
        {product.inventory.stockQuantity}
      </p>


      <p>
        Status:
        {" "}
        {product.status}
      </p>

    </div>
  );
}
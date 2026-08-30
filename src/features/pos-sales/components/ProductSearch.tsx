import {
  useState,
  useRef,
} from "react";

import type {
  Product,
} from "../../products/types/product.types";

import {
  productService,
} from "../../products/services/product.service";

import {
  usePosSalesStore,
} from "../store/pos-sales.store";


interface ProductSearchProps {

  products: Product[];

  tenantId?: string;

}


export function ProductSearch({
  products,
  tenantId,
}: ProductSearchProps) {


  const [
    search,
    setSearch,
  ] = useState("");

  const [
    results,
    setResults,
  ] = useState<Product[]>(
    products,
  );

  const [
    message,
    setMessage,
  ] = useState("");

  const inputRef =
    useRef<HTMLInputElement>(null);


  const addItem =
    usePosSalesStore(
      (state) =>
        state.addItem,
    );


  function addProduct(
    product: Product,
  ) {

    const price =
      Number(
        product.pricing.sellingPrice,
      );

    addItem({

      id:
        crypto.randomUUID(),

      saleId:
        "TEMP-CART",

      productId:
        product.id,

      productName:
        product.name,

      quantity:
        1,

      unitPrice:
        price,

      discountAmount:
        0,

      taxRate:
        Number(
          product.tax?.taxRate ?? 0,
        ),

      taxAmount:
        0,

      lineTotal:
        price,

    });

    setSearch("");

    setMessage(
      `${product.name} added to cart.`,
    );

    setResults(
      products,
    );

    inputRef.current?.focus();

  }


  async function handleSearch(
    value: string,
  ) {

    setSearch(value);

    setMessage("");

    const query =
      value.trim();

    if (!query) {

      setResults(
        products,
      );

      return;

    }


    const localMatches =
      products.filter(
        (product) => {

          const name =
            product.name
              .toLowerCase();

          const sku =
            (
              product.sku ?? ""
            )
              .toLowerCase();

          const barcode =
            (
              product.barcode ?? ""
            )
              .toLowerCase();

          const searchValue =
            query.toLowerCase();

          return (
            name.includes(
              searchValue,
            ) ||
            sku.includes(
              searchValue,
            ) ||
            barcode.includes(
              searchValue,
            )
          );

        },
      );


    setResults(
      localMatches,
    );


    if (
      localMatches.length === 1 &&
      localMatches[0].barcode &&
      localMatches[0].barcode
        .toLowerCase() ===
        query.toLowerCase()
    ) {

      addProduct(
        localMatches[0],
      );

      return;

    }


    if (
      tenantId &&
      localMatches.length === 0
    ) {

      try {

        const remote =
          await productService.searchProducts(
            tenantId,
            query,
          );

        setResults(
          remote,
        );

      } catch (error) {

        console.error(
          "POS product search failed:",
          error,
        );

        setMessage(
          "Product search failed.",
        );

      }

    }

  }


  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {

    if (
      event.key !== "Enter"
    ) {
      return;
    }

    const query =
      search.trim();

    if (!query) {
      return;
    }


    const exactBarcode =
      results.find(
        (product) =>
          product.barcode &&
          product.barcode
            .toLowerCase() ===
          query.toLowerCase(),
      );


    if (exactBarcode) {

      event.preventDefault();

      addProduct(
        exactBarcode,
      );

      return;

    }


    if (
      results.length === 1
    ) {

      event.preventDefault();

      addProduct(
        results[0],
      );

    }

  }


  return (

    <div>

      <input

        ref={inputRef}

        autoFocus

        className="w-full rounded border p-2"

        placeholder="Scan barcode or search product..."

        value={search}

        onChange={
          (event) =>
            void handleSearch(
              event.target.value,
            )
        }

        onKeyDown={
          handleKeyDown
        }

      />


      {message && (

        <p className="mt-2 text-sm">
          {message}
        </p>

      )}


      <div className="mt-4 space-y-2">

        {results.map(
          (product) => (

            <button

              key={product.id}

              type="button"

              className="w-full rounded border p-3 text-left"

              onClick={() =>
                addProduct(
                  product,
                )
              }

            >

              <div className="font-medium">
                {product.name}
              </div>

              <div className="text-sm text-gray-600">

                {product.pricing.sellingPrice}

                {" "}

                {product.pricing.currency}

              </div>

              {product.barcode && (

                <div className="text-xs text-gray-500">

                  Barcode: {product.barcode}

                </div>

              )}

            </button>

          ),
        )}

      </div>

    </div>

  );

}

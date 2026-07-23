import {
  useState,
} from "react";


import {
  ProductToolbar,
} from "../components/ProductToolbar";


import {
  ProductTable,
} from "../components/ProductTable";


import {
  DeleteProductDialog,
} from "../components/DeleteProductDialog";


import {
  useProducts,
} from "../hooks/useProducts";



export function ProductsPage() {


  const {
    products,
    removeProduct,

  } = useProducts();



  const [
    search,
    setSearch,
  ] = useState("");



  const [
    status,
    setStatus,
  ] = useState("all");



  const [
    selectedId,
    setSelectedId,
  ] = useState<string | null>(null);



  const filteredProducts =
    products.filter(
      (product) => {

        const matchesSearch =
          product.name
            .toLowerCase()
            .includes(
              search.toLowerCase(),
            );


        const matchesStatus =
          status === "all"
          ||
          product.status === status;


        return (
          matchesSearch
          &&
          matchesStatus
        );

      },
    );



  const selectedProduct =
    products.find(
      (product) =>
        product.id === selectedId,
    );



  return (

    <div
      className="
        p-6
      "
    >

      <h1
        className="
          text-2xl
          font-bold
          mb-6
        "
      >
        Products
      </h1>


      <ProductToolbar

        search={search}

        onSearchChange={setSearch}

        status={status}

        onStatusChange={setStatus}

      />


      <ProductTable

        products={filteredProducts}

        onDelete={setSelectedId}

      />


      <DeleteProductDialog

        open={selectedId !== null}

        productName={
          selectedProduct?.name
        }

        onCancel={() =>
          setSelectedId(null)
        }

        onConfirm={() => {

          if (selectedId) {

            removeProduct(
              selectedId,
            );

          }


          setSelectedId(null);

        }}

      />


    </div>

  );

}
import {
  useState,
} from "react";


import {
  BrandToolbar,
} from "../components/BrandToolbar";


import {
  BrandTable,
} from "../components/BrandTable";


import {
  useBrands,
} from "../hooks/useBrands";



export function BrandsPage() {


  const {
    brands,
    removeBrand,
  } = useBrands();



  const [
    search,
    setSearch,
  ] = useState("");



  const filteredBrands =
    brands.filter(
      (brand) =>
        brand.name
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );



  return (

    <div
      className="p-6"
    >

      <h1
        className="
          text-2xl
          font-bold
          mb-6
        "
      >

        Brands

      </h1>



      <BrandToolbar

        search={search}

        onSearchChange={setSearch}

      />



      <BrandTable

        brands={filteredBrands}

        onDelete={removeBrand}

      />


    </div>

  );

}
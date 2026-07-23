import {
  useState,
} from "react";


import {
  CategoryToolbar,
} from "../components/CategoryToolbar";


import {
  CategoryTable,
} from "../components/CategoryTable";


import {
  useCategories,
} from "../hooks/useCategories";



export function CategoriesPage() {


  const {
    categories,
    removeCategory,
  } = useCategories();



  const [
    search,
    setSearch,
  ] = useState("");



  const filteredCategories =
    categories.filter(
      (category) =>
        category.name
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

        Categories

      </h1>



      <CategoryToolbar

        search={search}

        onSearchChange={setSearch}

      />



      <CategoryTable

        categories={filteredCategories}

        onDelete={removeCategory}

      />


    </div>

  );

}
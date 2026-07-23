import {
  useNavigate,
} from "react-router-dom";


import {
  CategoryForm,
} from "../components/CategoryForm";


import {
  categoryService,
} from "../services/category.service";



export function CreateCategoryPage() {


  const navigate = useNavigate();



  function handleSubmit(
    data: Parameters<
      typeof categoryService.createCategory
    >[0],
  ) {


    categoryService.createCategory(

      data,

      "default-tenant",

      "default-store",

    );


    navigate("/categories");

  }



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

        Create Category

      </h1>



      <CategoryForm

        onSubmit={handleSubmit}

      />


    </div>

  );

}
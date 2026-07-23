import {
  useNavigate,
  useParams,
} from "react-router-dom";


import {
  CategoryForm,
} from "../components/CategoryForm";


import {
  categoryService,
} from "../services/category.service";



export function EditCategoryPage() {


  const navigate = useNavigate();


  const {
    id,
  } = useParams();



  const foundCategory =
    id
      ? categoryService.getCategoryById(id)
      : undefined;



  if (!foundCategory) {

    return (

      <div
        className="p-6"
      >

        Category not found

      </div>

    );

  }



  const category = foundCategory;



  function handleSubmit(
    data: Parameters<
      typeof categoryService.createCategory
    >[0],
  ) {


    categoryService.updateCategory(

      category.id,

      {

        name:
          data.name,


        description:
          data.description,

      },

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

        Edit Category

      </h1>



      <CategoryForm

        defaultValues={{

          name:
            category.name,


          description:
            category.description,

        }}


        onSubmit={handleSubmit}

      />


    </div>

  );

}
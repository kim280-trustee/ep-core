import {
  Link,
} from "react-router-dom";


import type {
  Category,
} from "../types/category.types";


interface CategoryTableProps {

  categories: Category[];

  onDelete: (
    id: string,
  ) => void;

}



export function CategoryTable({

  categories,

  onDelete,

}: CategoryTableProps) {


  if (categories.length === 0) {

    return (

      <div className="p-6 border rounded">

        No categories found.

      </div>

    );

  }



  return (

    <table className="w-full">

      <thead>

        <tr>

          <th className="text-left p-3">
            Name
          </th>

          <th className="text-left p-3">
            Description
          </th>

          <th className="text-left p-3">
            Actions
          </th>

        </tr>

      </thead>


      <tbody>

        {categories.map(

          (category) => (

            <tr
              key={category.id}
              className="border-t"
            >

              <td className="p-3">

                {category.name}

              </td>


              <td className="p-3">

                {category.description || "-"}

              </td>


              <td className="p-3 flex gap-3">

                <Link

                  to={`/categories/edit/${category.id}`}

                  className="underline"

                >

                  Edit

                </Link>


                <button

                  onClick={() =>
                    onDelete(category.id)
                  }

                  className="text-red-600"

                >

                  Delete

                </button>


              </td>


            </tr>

          ),

        )}

      </tbody>


    </table>

  );

}
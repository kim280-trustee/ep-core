/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Category Table
 * ============================================================
 */


import type {

  Category,

} from "../types/category.types";







interface CategoryTableProps {


  categories:Category[];



  onDelete:

    (

      id:string,

    )=>void;


}








export function CategoryTable({


  categories,


  onDelete,


}:CategoryTableProps){





  return (



    <div

      className="

      border

      rounded

      overflow-hidden

      "

    >





      {

        categories.map(



          category => (



            <div


              key={category.id}



              className="

              flex

              justify-between

              items-center

              p-3

              border-b

              "


            >



              <div>



                <p

                  className="font-medium"

                >

                  {category.name}


                </p>





                {

                  category.description && (


                    <p

                      className="text-sm"

                    >

                      {category.description}


                    </p>


                  )


                }


              </div>






              <button



                onClick={()=>


                  onDelete(

                    category.id,

                  )

                }



                className="

                text-red-600

                "



              >


                Delete


              </button>






            </div>



          )


        )

      }






    </div>


  );


}
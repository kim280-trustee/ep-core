/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Brand Table
 * ============================================================
 */


import type {
  Brand,
} from "../types/brand.types";



interface BrandTableProps {

  brands: Brand[];

  onDelete(
    id:string,
  ):void;

}



export function BrandTable({

  brands,

  onDelete,

}:BrandTableProps){


  if(
    brands.length === 0
  ){

    return (

      <div

        className="
        p-6
        border
        rounded
        text-gray-500
        "

      >

        No brands found.

      </div>

    );

  }



  return (

    <div

      className="
      border
      rounded
      overflow-hidden
      "

    >


      {
        brands.map(

          brand=>(

            <div

              key={
                brand.id
              }

              className="
              flex
              justify-between
              items-center
              p-4
              border-b
              "

            >


              <div>


                <p

                  className="
                  font-medium
                  "

                >

                  {brand.name}

                </p>



                {
                  brand.description && (

                    <p

                      className="
                      text-sm
                      text-gray-500
                      "

                    >

                      {brand.description}

                    </p>

                  )
                }



                <span

                  className="
                  text-xs
                  "

                >

                  {brand.status}

                </span>



              </div>




              <button

                onClick={()=>


                  onDelete(
                    brand.id,
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
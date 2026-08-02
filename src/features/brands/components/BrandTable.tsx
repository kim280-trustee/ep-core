import type {

  Brand,

} from "../types/brand.types";


import {

  BrandStatusBadge,

} from "./BrandStatusBadge";






interface Props {


  brands:Brand[];


  onDelete:

    (

      id:string,

    )=>void;


}








export function BrandTable({

  brands,

  onDelete,

}:Props){



  return (



    <div

      className="

      border

      rounded

      overflow-hidden

      "

    >




      {

        brands.map(brand=>(


          <div


            key={brand.id}



            className="

            flex

            justify-between

            items-center

            p-3

            border-b

            "

          >




            <div>


              <p className="font-medium">

                {brand.name}

              </p>



              {

                brand.description &&

                <p className="text-sm">

                  {brand.description}

                </p>

              }



            </div>







            <div className="flex gap-4 items-center">



              <BrandStatusBadge

                status={brand.status}

              />





              <button


                onClick={

                  ()=>onDelete(

                    brand.id,

                  )

                }


                className="text-red-600"


              >

                Delete


              </button>




            </div>





          </div>


        ))

      }





    </div>


  );


}
/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Edit Brand Page
 * ============================================================
 */


import {

  useNavigate,

  useParams,

} from "react-router-dom";


import {

  BrandForm,

} from "../components/BrandForm";


import {

  brandService,

} from "../services/brand.service";








export function EditBrandPage(){



  const navigate =

    useNavigate();



  const {

    id,

  } = useParams();







  const brand =

    id

      ?

      brandService.getBrandById(id)

      :

      undefined;







  if(!brand){



    return <div className="p-6">

      Brand not found

    </div>;


  }







  return (


    <div className="p-6">



      <h1

        className="

        text-2xl

        font-bold

        mb-6

        "

      >

        Edit Brand


      </h1>







      <BrandForm



        defaultValues={{


          name:

            brand.name,


          code:

            brand.code,


          description:

            brand.description,


          logoUrl:

            brand.logoUrl,


        }}



        onSubmit={(data)=>{



          brandService.updateBrand(

            brand.id,

            data,

          );



          navigate("/brands");



        }}



      />





    </div>


  );


}
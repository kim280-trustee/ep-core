/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Create Brand Page
 * ============================================================
 */


import {

  useNavigate,

} from "react-router-dom";


import {

  BrandForm,

} from "../components/BrandForm";


import {

  brandService,

} from "../services/brand.service";








export function CreateBrandPage(){



  const navigate =

    useNavigate();







  function handleSubmit(

    data:Parameters<

      typeof brandService.createBrand

    >[2],

  ){



    brandService.createBrand(

      "default-tenant",

      "default-store",

      data,

    );




    navigate("/brands");


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

        Create Brand


      </h1>






      <BrandForm

        onSubmit={handleSubmit}

      />





    </div>


  );


}
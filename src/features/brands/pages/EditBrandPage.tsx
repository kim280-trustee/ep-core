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



export function EditBrandPage() {


  const navigate =
    useNavigate();


  const {
    id,
  } = useParams();



  const foundBrand =
    id
      ? brandService.getBrandById(id)
      : undefined;



  if (!foundBrand) {

    return (

      <div
        className="p-6"
      >

        Brand not found

      </div>

    );

  }



  const brand = foundBrand;



  function handleSubmit(

    data: Parameters<
      typeof brandService.createBrand
    >[0],

  ) {


    brandService.updateBrand(

      brand.id,

      {

        name:
          data.name,


        description:
          data.description ?? null,

      },

    );


    navigate("/brands");

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

        Edit Brand

      </h1>



      <BrandForm

        defaultValues={{

          name:
            brand.name,


          description:
            brand.description ?? undefined,

        }}


        onSubmit={handleSubmit}

      />


    </div>

  );

}
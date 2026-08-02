import {

  useNavigate,

  useParams,

} from "react-router-dom";


import {

  WarehouseForm,

} from "../components/WarehouseForm";


import {

  warehouseService,

} from "../services/warehouse.service";



type WarehouseFormData =

  Parameters<

    NonNullable<

      React.ComponentProps<

        typeof WarehouseForm

      >["onSubmit"]

    >

  >[0];





export function EditWarehousePage(){



  const {

    id,

  } = useParams();





  const navigate =

    useNavigate();





  const warehouse =

    id

      ? warehouseService.getWarehouseById(id)

      : undefined;







  function handleSubmit(

    data: WarehouseFormData,

  ){



    if(!id){

      return;

    }






    warehouseService.updateWarehouse(

      id,

      data,

    );





    navigate(

      "/warehouses",

    );



  }







  return (



    <WarehouseForm



      defaultValues={

        warehouse

      }



      onSubmit={

        handleSubmit

      }



    />



  );



}
import {
  useNavigate,
} from "react-router-dom";


import {
  CustomerForm,
} from "../components/CustomerForm";


import {
  customerService,
} from "../services/customer.service";



export function CreateCustomerPage() {


  const navigate =
    useNavigate();



  function handleSubmit(

    data: Parameters<
      typeof customerService.createCustomer
    >[0],

  ) {


    customerService.createCustomer(

      data,

      "default-tenant",

      "default-store",

    );


    navigate("/customers");

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

        Create Customer

      </h1>



      <CustomerForm

        onSubmit={handleSubmit}

      />


    </div>

  );

}
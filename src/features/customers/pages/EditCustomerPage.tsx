import {
  useNavigate,
  useParams,
} from "react-router-dom";


import {
  CustomerForm,
} from "../components/CustomerForm";


import {
  customerService,
} from "../services/customer.service";



export function EditCustomerPage() {


  const navigate =
    useNavigate();


  const {
    id,
  } = useParams();



  const foundCustomer =
    id
      ? customerService.getCustomerById(id)
      : undefined;



  if (!foundCustomer) {

    return (

      <div
        className="p-6"
      >

        Customer not found

      </div>

    );

  }



  const customer = foundCustomer;



  function handleSubmit(

    data: Parameters<
      typeof customerService.createCustomer
    >[0],

  ) {


    customerService.updateCustomer(

      customer.id,

      {

        name:
          data.name,


        phone:
          data.phone,


        email:
          data.email,


        address:
          data.address,


        customerType:
          data.customerType,


        creditLimit:
          data.creditLimit,

      },

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

        Edit Customer

      </h1>



      <CustomerForm

        defaultValues={{

          name:
            customer.name,


          phone:
            customer.phone,


          email:
            customer.email,


          address:
            customer.address,


          customerType:
            customer.customerType,


          creditLimit:
            customer.creditLimit,

        }}


        onSubmit={handleSubmit}

      />


    </div>

  );

}
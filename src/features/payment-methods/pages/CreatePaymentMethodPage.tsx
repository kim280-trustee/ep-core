import {
  useNavigate,
} from "react-router-dom";


import {
  PaymentMethodForm,
} from "../components/PaymentMethodForm";


import {
  paymentMethodService,
} from "../services/payment-method.service";


type PaymentMethodFormData =
  Parameters<
    NonNullable<
      React.ComponentProps<
        typeof PaymentMethodForm
      >["onSubmit"]
    >
  >[0];



export function CreatePaymentMethodPage() {


  const navigate =
    useNavigate();



  function submit(
    data: PaymentMethodFormData,
  ) {


    paymentMethodService.createPaymentMethod(

      "default-tenant",

      "default-store",

      data,

    );


    navigate(
      "/payment-methods",
    );


  }



  return (

    <PaymentMethodForm

      onSubmit={submit}

    />

  );


}
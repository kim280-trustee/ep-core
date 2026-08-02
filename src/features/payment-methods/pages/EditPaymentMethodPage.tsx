import {
  useParams,

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



export function EditPaymentMethodPage() {


  const {
    id,
  } = useParams();



  const navigate =
    useNavigate();



  function submit(
    data: PaymentMethodFormData,
  ) {


    if (!id) {

      return;

    }



    paymentMethodService.updatePaymentMethod(

      id,

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
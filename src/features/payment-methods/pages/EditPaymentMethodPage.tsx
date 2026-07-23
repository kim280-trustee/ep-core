import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  PaymentMethodForm,
} from "../components/PaymentMethodForm";

import {
  paymentMethodService,
} from "../services/payment-method.service";

export function EditPaymentMethodPage() {

  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();

  const foundPaymentMethod =
    id
      ? paymentMethodService.getPaymentMethodById(id)
      : undefined;

  if (!foundPaymentMethod) {

    return (
      <div className="p-6">
        Payment method not found
      </div>
    );

  }

  const paymentMethod =
    foundPaymentMethod;

  function handleSubmit(
    data: Parameters<
      typeof paymentMethodService.createPaymentMethod
    >[0],
  ) {

    paymentMethodService.updatePaymentMethod(
      paymentMethod.id,
      {
        name: data.name,
        code: data.code,
        type: data.type,
        isDefault: data.isDefault,
        isActive: data.isActive,
      },
    );

    navigate("/payment-methods");

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

        Edit Payment Method

      </h1>

      <PaymentMethodForm
        defaultValues={{
          name: paymentMethod.name,
          code: paymentMethod.code,
          type: paymentMethod.type,
          isDefault: paymentMethod.isDefault,
          isActive: paymentMethod.isActive,
        }}
        onSubmit={handleSubmit}
      />

    </div>

  );

}
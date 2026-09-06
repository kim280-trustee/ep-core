import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  CustomerForm,
} from "../components/CustomerForm";

import {
  useCustomers,
} from "../hooks/useCustomers";

import type {
  Customer,
} from "../types/customer.types";

import type {
  CustomerFormInput,
} from "../validators/customer.schema";


export function EditCustomerPage() {

  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();

  const {
    customers,
    updateCustomer,
  } = useCustomers();

  const [
    customer,
    setCustomer,
  ] =
    useState<Customer>();


  useEffect(
    () => {

      if (!id) {
        return;
      }

      const found =
        customers.find(
          (item) =>
            item.id === id,
        );

      setCustomer(found);

    },
    [
      customers,
      id,
    ],
  );


  if (!id || !customer) {

    return (
      <div className="p-6">
        Customer not found
      </div>
    );

  }


  const customerId =
    id;


  async function handleSubmit(
    data: CustomerFormInput,
  ) {

    await updateCustomer(
      customerId,
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

    <div className="p-6">

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

        onSubmit={
          handleSubmit
        }

      />

    </div>

  );

}

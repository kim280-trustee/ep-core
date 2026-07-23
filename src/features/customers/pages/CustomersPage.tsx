import {
  useState,
} from "react";


import {
  CustomerToolbar,
} from "../components/CustomerToolbar";


import {
  CustomerTable,
} from "../components/CustomerTable";


import {
  useCustomers,
} from "../hooks/useCustomers";



export function CustomersPage() {


  const {
    customers,
    removeCustomer,
  } = useCustomers();



  const [
    search,
    setSearch,
  ] = useState("");



  const filteredCustomers =
    customers.filter(
      (customer) =>
        customer.name
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );



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

        Customers

      </h1>



      <CustomerToolbar

        search={search}

        onSearchChange={setSearch}

      />



      <CustomerTable

        customers={filteredCustomers}

        onDelete={removeCustomer}

      />


    </div>

  );

}
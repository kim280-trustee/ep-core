import CreateSalesOrderForm from "../components/CreateSalesOrderForm";


import SalesOrderList from "../components/SalesOrderList";


import AddSalesOrderItemForm from "../components/AddSalesOrderItemForm";



export default function SalesOrdersPage() {


  return (

    <div>


      <h1>

        Sales Management

      </h1>



      <CreateSalesOrderForm />



      <hr />



      <AddSalesOrderItemForm />



      <hr />



      <SalesOrderList />


    </div>

  );

}
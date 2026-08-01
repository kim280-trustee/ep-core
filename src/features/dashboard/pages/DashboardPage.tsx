import {
  useDashboard,
} from "../hooks";



export default function DashboardPage() {


  const {

    summary,

  } = useDashboard();



  return (

    <div>


      <h1>

        Business Dashboard

      </h1>



      <div>


        <p>

          Total Sales:

          {" "}

          {summary.totalSales}

        </p>



        <p>

          Total Purchases:

          {" "}

          {summary.totalPurchases}

        </p>



        <p>

          Revenue:

          {" "}

          {summary.totalRevenue}

        </p>



        <p>

          Profit:

          {" "}

          {summary.totalProfit}

        </p>



        <p>

          Inventory Value:

          {" "}

          {summary.inventoryValue}

        </p>



        <p>

          Low Stock Items:

          {" "}

          {summary.lowStockItems}

        </p>



        <p>

          Customers:

          {" "}

          {summary.totalCustomers}

        </p>



        <p>

          Suppliers:

          {" "}

          {summary.totalSuppliers}

        </p>


      </div>


    </div>

  );

}
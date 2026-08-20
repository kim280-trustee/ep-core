/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Dashboard Page
 * ============================================================
 */

import {
  useDashboard,
} from "../hooks";


export default function DashboardPage() {

  const {
    summary,
  } = useDashboard();


  return (

    <div className="p-6">

      <h1 className="text-3xl font-bold">
        Business Dashboard
      </h1>


      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-lg border bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Total Sales
          </p>

          <p className="mt-2 text-2xl font-bold">
            {summary.totalSales}
          </p>

        </div>


        <div className="rounded-lg border bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Total Revenue
          </p>

          <p className="mt-2 text-2xl font-bold">
            THB {summary.totalRevenue.toFixed(2)}
          </p>

        </div>


        <div className="rounded-lg border bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Total Purchases
          </p>

          <p className="mt-2 text-2xl font-bold">
            {summary.totalPurchases}
          </p>

        </div>


        <div className="rounded-lg border bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Inventory Value
          </p>

          <p className="mt-2 text-2xl font-bold">
            THB {summary.inventoryValue.toFixed(2)}
          </p>

        </div>


        <div className="rounded-lg border bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Profit
          </p>

          <p className="mt-2 text-2xl font-bold">
            THB {summary.totalProfit.toFixed(2)}
          </p>

        </div>


        <div className="rounded-lg border bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Low Stock Items
          </p>

          <p className="mt-2 text-2xl font-bold">
            {summary.lowStockItems}
          </p>

        </div>


        <div className="rounded-lg border bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Customers
          </p>

          <p className="mt-2 text-2xl font-bold">
            {summary.totalCustomers}
          </p>

        </div>


        <div className="rounded-lg border bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Suppliers
          </p>

          <p className="mt-2 text-2xl font-bold">
            {summary.totalSuppliers}
          </p>

        </div>

      </div>

    </div>

  );

}


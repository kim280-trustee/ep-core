import {
  useState,
} from "react";

import {
  UserRound,
  Users,
} from "lucide-react";

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

  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase()),
  );

  const regularCustomers = customers.filter(
    (customer) => customer.customerType === "regular",
  ).length;
  const wholesaleCustomers = customers.filter(
    (customer) => customer.customerType === "wholesale",
  ).length;

  return (
    <div className="min-h-full bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="overflow-hidden rounded-3xl bg-slate-900 px-5 py-6 text-white shadow-sm sm:px-7 sm:py-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-200">
                <Users className="h-3.5 w-3.5" />
                Customer management
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Customers
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Manage your customer list, customer types, and contact details from one place.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs text-slate-300">Total</p>
                <p className="mt-1 text-xl font-bold">{customers.length}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs text-slate-300">Regular</p>
                <p className="mt-1 text-xl font-bold">{regularCustomers}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs text-slate-300">Wholesale</p>
                <p className="mt-1 text-xl font-bold">{wholesaleCustomers}</p>
              </div>
            </div>
          </div>
        </section>

        <CustomerToolbar
          search={search}
          onSearchChange={setSearch}
        />

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <UserRound className="h-4 w-4" />
          {search
            ? `${filteredCustomers.length} customer${filteredCustomers.length === 1 ? "" : "s"} match your search`
            : `${customers.length} customer${customers.length === 1 ? "" : "s"} in this store`}
        </div>

        <CustomerTable
          customers={filteredCustomers}
          onDelete={removeCustomer}
        />
      </div>
    </div>
  );
}

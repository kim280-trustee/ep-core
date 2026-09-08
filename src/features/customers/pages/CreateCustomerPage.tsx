import {
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  UserPlus,
  Users,
} from "lucide-react";

import {
  CustomerForm,
} from "../components/CustomerForm";

import {
  customerService,
} from "../services/customer.service";

import {
  storeContext,
} from "../../../core/store/store.context";

export function CreateCustomerPage() {
  const navigate = useNavigate();

  function handleSubmit(
    data: Parameters<typeof customerService.createCustomer>[0],
  ) {
    const context = storeContext.getStore();

    if (!context) {
      throw new Error("Store context is not initialized.");
    }

    customerService.createCustomer(
      data,
      context.tenantId,
      context.storeId,
    );

    navigate("/customers");
  }

  return (
    <div className="min-h-full bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="overflow-hidden rounded-3xl bg-slate-900 px-5 py-6 text-white shadow-sm sm:px-7 sm:py-7">
          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Customers
          </button>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Add Customer
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Add a customer to this store and keep their contact and account details organized.
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users className="h-4 w-4" />
          Customer information
        </div>

        <CustomerForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

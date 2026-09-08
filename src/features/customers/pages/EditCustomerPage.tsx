import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, UserRound } from "lucide-react";
import { CustomerForm } from "../components/CustomerForm";
import { useCustomers } from "../hooks/useCustomers";
import type { Customer } from "../types/customer.types";
import type { CustomerFormInput } from "../validators/customer.schema";
import { useTranslation } from "@/core/i18n/useTranslation";

export function EditCustomerPage() {
  const navigate = useNavigate();
  const { id: customerId } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { customers, updateCustomer } = useCustomers();
  const [customer, setCustomer] = useState<Customer>();

  useEffect(() => {
    if (!customerId) return;
    setCustomer(customers.find((item) => item.id === customerId));
  }, [customers, customerId]);

  if (!customerId || !customer) {
    return (
      <div className="min-h-full bg-slate-100 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <UserRound className="mx-auto h-10 w-10 text-slate-300" />
          <h1 className="mt-4 text-lg font-semibold text-slate-900">
            {t("customers.customerNotFound")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("customers.customerNotFoundDescription")}
          </p>
          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(data: CustomerFormInput) {
    if (!customerId) return;

    await updateCustomer(customerId, {
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      customerType: data.customerType,
      creditLimit: data.creditLimit,
    });

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
            {t("common.back")}
          </button>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
              <Pencil className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t("customers.editCustomer")}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {t("customers.customerManagement")}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-slate-200">
                <UserRound className="h-3.5 w-3.5" />
                {customer.name}
              </div>
            </div>
          </div>
        </section>

        <CustomerForm
          defaultValues={{
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            customerType: customer.customerType,
            creditLimit: customer.creditLimit,
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

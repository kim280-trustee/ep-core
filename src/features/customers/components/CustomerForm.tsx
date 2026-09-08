import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { customerSchema } from "../validators/customer.schema";
import type { CustomerFormInput } from "../validators/customer.schema";
import { useTranslation } from "../../../core/i18n/useTranslation";

interface CustomerFormProps {
  defaultValues?: Partial<CustomerFormInput>;
  onSubmit: (data: CustomerFormInput) => void;
}

const inputClassName = "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100";

export function CustomerForm({ defaultValues, onSubmit }: CustomerFormProps) {
  const { t, language } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm<CustomerFormInput>({
    resolver: zodResolver(customerSchema),
    defaultValues,
  });
  const addressLabel = language === "th" ? "ที่อยู่" : "Address";
  const creditLimitLabel = language === "th" ? "วงเงินเครดิต" : "Credit Limit";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">{t("customers.customerName")}</label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input {...register("name")} placeholder={t("customers.customerName")} className={`${inputClassName} pl-10`} />
          </div>
          {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">{t("customers.phone")}</label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input {...register("phone")} placeholder={t("customers.phone")} className={`${inputClassName} pl-10`} />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">{t("customers.email")}</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="email" {...register("email")} placeholder={t("customers.email")} className={`${inputClassName} pl-10`} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">{addressLabel}</label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <textarea {...register("address")} placeholder={addressLabel} rows={3} className={`${inputClassName} h-auto resize-none py-3 pl-10`} />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">{t("customers.customerType")}</label>
          <select {...register("customerType")} className={inputClassName}>
            <option value="regular">{t("customers.regular")}</option>
            <option value="retail">{t("customers.retail")}</option>
            <option value="wholesale">{t("customers.wholesale")}</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">{creditLimitLabel}</label>
          <div className="relative">
            <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="number" {...register("creditLimit", { valueAsNumber: true })} placeholder="0" className={`${inputClassName} pl-10`} />
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
        <button type="submit" className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200">
          {t("customers.saveCustomer")}
        </button>
      </div>
    </form>
  );
}

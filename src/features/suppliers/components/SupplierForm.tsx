import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supplierSchema } from "../validators/supplier.schema";
import type { SupplierFormInput } from "../validators/supplier.schema";
import { useTranslation } from "../../../core/i18n/useTranslation";

interface SupplierFormProps { defaultValues?: Partial<SupplierFormInput>; onSubmit(data: SupplierFormInput): void; }

export function SupplierForm({ defaultValues, onSubmit }: SupplierFormProps) {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm<SupplierFormInput>({ resolver: zodResolver(supplierSchema), defaultValues });
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
    <div><input {...register("name")} placeholder={t("suppliers.supplierName")} className="border rounded p-2 w-full" />{errors.name && <p className="text-red-600">{errors.name.message}</p>}</div>
    <input {...register("contactPerson")} placeholder={t("suppliers.contactName")} className="border rounded p-2 w-full" />
    <input {...register("phone")} placeholder={t("suppliers.phone")} className="border rounded p-2 w-full" />
    <input {...register("email")} placeholder={t("suppliers.email")} className="border rounded p-2 w-full" />
    <textarea {...register("address")} placeholder={t("suppliers.address")} className="border rounded p-2 w-full" />
    <input {...register("taxId")} placeholder={t("common.tax")} className="border rounded p-2 w-full" />
    <input {...register("paymentTerms")} placeholder={t("suppliers.paymentTerms")} className="border rounded p-2 w-full" />
    <button type="submit" className="bg-black text-white px-5 py-2 rounded">{t("suppliers.saveSupplier")}</button>
  </form>;
}

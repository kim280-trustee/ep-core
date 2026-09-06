import {
  useEffect,
  useState,
} from "react";

import type {
  CreateWarehouseDto,
} from "../types/warehouse.types";

export type WarehouseFormInput =
  CreateWarehouseDto;

interface WarehouseFormProps {
  defaultValues?:
    Partial<WarehouseFormInput>;

  onSubmit:
    (
      data: WarehouseFormInput,
    ) => void | Promise<void>;
}

export function WarehouseForm({
  defaultValues,
  onSubmit,
}: WarehouseFormProps) {

  const [
    form,
    setForm,
  ] = useState<WarehouseFormInput>({
    code:
      defaultValues?.code ?? "",
    name:
      defaultValues?.name ?? "",
    address:
      defaultValues?.address ?? "",
    city:
      defaultValues?.city ?? "",
    province:
      defaultValues?.province ?? "",
    postalCode:
      defaultValues?.postalCode ?? "",
    country:
      defaultValues?.country ?? "Thailand",
    phone:
      defaultValues?.phone ?? "",
    managerName:
      defaultValues?.managerName ?? "",
  });

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  useEffect(() => {
    setForm({
      code:
        defaultValues?.code ?? "",
      name:
        defaultValues?.name ?? "",
      address:
        defaultValues?.address ?? "",
      city:
        defaultValues?.city ?? "",
      province:
        defaultValues?.province ?? "",
      postalCode:
        defaultValues?.postalCode ?? "",
      country:
        defaultValues?.country ?? "Thailand",
      phone:
        defaultValues?.phone ?? "",
      managerName:
        defaultValues?.managerName ?? "",
    });
  }, [
    defaultValues,
  ]);

  function updateField(
    field:
      keyof WarehouseFormInput,
    value: string,
  ) {
    setForm(
      current => ({
        ...current,
        [field]: value,
      }),
    );
  }

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (
      !form.code.trim()
      ||
      !form.name.trim()
      ||
      !form.address.trim()
      ||
      !form.city.trim()
      ||
      !form.province.trim()
      ||
      !form.postalCode.trim()
      ||
      !form.country.trim()
    ) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        code:
          form.code.trim(),
        name:
          form.name.trim(),
        address:
          form.address.trim(),
        city:
          form.city.trim(),
        province:
          form.province.trim(),
        postalCode:
          form.postalCode.trim(),
        country:
          form.country.trim(),
        phone:
          form.phone?.trim() || undefined,
        managerName:
          form.managerName?.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
    >

      <div>
        <label>
          Warehouse Code
        </label>

        <input
          value={
            form.code
          }
          onChange={
            event =>
              updateField(
                "code",
                event.target.value,
              )
          }
          required
        />
      </div>

      <div>
        <label>
          Warehouse Name
        </label>

        <input
          value={
            form.name
          }
          onChange={
            event =>
              updateField(
                "name",
                event.target.value,
              )
          }
          required
        />
      </div>

      <div>
        <label>
          Address
        </label>

        <input
          value={
            form.address
          }
          onChange={
            event =>
              updateField(
                "address",
                event.target.value,
              )
          }
          required
        />
      </div>

      <div>
        <label>
          City
        </label>

        <input
          value={
            form.city
          }
          onChange={
            event =>
              updateField(
                "city",
                event.target.value,
              )
          }
          required
        />
      </div>

      <div>
        <label>
          Province
        </label>

        <input
          value={
            form.province
          }
          onChange={
            event =>
              updateField(
                "province",
                event.target.value,
              )
          }
          required
        />
      </div>

      <div>
        <label>
          Postal Code
        </label>

        <input
          value={
            form.postalCode
          }
          onChange={
            event =>
              updateField(
                "postalCode",
                event.target.value,
              )
          }
          required
        />
      </div>

      <div>
        <label>
          Country
        </label>

        <input
          value={
            form.country
          }
          onChange={
            event =>
              updateField(
                "country",
                event.target.value,
              )
          }
          required
        />
      </div>

      <div>
        <label>
          Phone
        </label>

        <input
          value={
            form.phone ?? ""
          }
          onChange={
            event =>
              updateField(
                "phone",
                event.target.value,
              )
          }
        />
      </div>

      <div>
        <label>
          Manager Name
        </label>

        <input
          value={
            form.managerName ?? ""
          }
          onChange={
            event =>
              updateField(
                "managerName",
                event.target.value,
              )
          }
        />
      </div>

      <button
        type="submit"
        disabled={
          submitting
        }
      >
        {submitting
          ? "Saving..."
          : "Save Warehouse"}
      </button>

    </form>
  );
}

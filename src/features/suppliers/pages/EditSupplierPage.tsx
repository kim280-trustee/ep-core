import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { storeContext } from "@/core/store/store.context";

import { SupplierForm } from "../components/SupplierForm";
import {
  supplierService,
} from "../services/supplier.service";

import type {
  UpdateSupplierDto,
} from "../types/supplier.types";


export function EditSupplierPage() {

  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  

  const [error, setError] =
    useState("");

  const [supplier, setSupplier] =
    useState<any>(null);


  useEffect(() => {

    async function loadSupplier() {

      if (!id) {

        setError("Supplier ID is missing.");
        setLoading(false);

        return;

      }

      const context =
        storeContext.getStore();

      if (!context?.tenantId) {

        setError(
          "Tenant context is not initialized.",
        );

        setLoading(false);

        return;

      }

      try {

        setError("");

        const result =
          await supplierService.getSupplierById(
            context.tenantId,
            id,
          );

        if (!result) {

          setError(
            "Supplier not found.",
          );

          return;

        }

        setSupplier(result);

      } catch (err) {

        console.error(
          "Failed to load supplier:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load supplier.",
        );

      } finally {

        setLoading(false);

      }

    }

    void loadSupplier();

  }, [id]);


  async function handleSubmit(
    values: UpdateSupplierDto,
  ) {

    if (!id) {

      setError("Supplier ID is missing.");

      return;

    }

    const context =
      storeContext.getStore();

    if (!context?.tenantId) {

      setError(
        "Tenant context is not initialized.",
      );

      return;

    }

    try {
      setError("");

      await supplierService.updateSupplier(
        context.tenantId,
        id,
        values,
      );

      navigate("/suppliers");

    } catch (err) {

      console.error(
        "Failed to update supplier:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update supplier.",
      );

    } finally {

    }

  }


  if (loading) {

    return (
      <div>
        Loading supplier...
      </div>
    );

  }


  if (error && !supplier) {

    return (
      <div>
        <h1>Edit Supplier</h1>

        <p>{error}</p>

        <button
          type="button"
          onClick={() =>
            navigate("/suppliers")
          }
        >
          Back to Suppliers
        </button>
      </div>
    );

  }


  if (!supplier) {

    return (
      <div>
        <h1>Edit Supplier</h1>

        <p>Supplier not found.</p>

        <button
          type="button"
          onClick={() =>
            navigate("/suppliers")
          }
        >
          Back to Suppliers
        </button>
      </div>
    );

  }


  return (

    <div>

      <h1>
        Edit Supplier
      </h1>

      {error && (
        <p>
          {error}
        </p>
      )}

      <SupplierForm

        onSubmit={
          handleSubmit
        }
      />

    </div>

  );

}






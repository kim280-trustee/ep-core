/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Edit Unit Page
 * ============================================================
 */

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  UnitForm,
} from "../components/UnitForm";

import {
  useUnits,
} from "../hooks/useUnits";

import {
  unitService,
} from "../services/unit.service";

import {
  storeContext,
} from "../../../core/store/store.context";

export function EditUnitPage() {

  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();

  const {
    updateUnitById,
  } =
    useUnits();

  const context =
    storeContext.getStore();

  const tenantId =
    context?.tenantId ?? "";

  const [unit, setUnit] =
    useState<
      Awaited<
        ReturnType<
          typeof unitService.getUnitById
        >
      >
    >(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    let active = true;

    async function load() {

      if (!tenantId || !id) {
        if (active) {
          setLoading(false);
        }
        return;
      }

      const result =
        await unitService.getUnitById(
          tenantId,
          id,
        );

      if (active) {
        setUnit(result);
        setLoading(false);
      }

    }

    void load();

    return () => {
      active = false;
    };

  }, [
    tenantId,
    id,
  ]);

  if (loading) {

    return (
      <div className="p-6">
        Loading unit...
      </div>
    );

  }

  if (!unit) {

    return (
      <div className="p-6">
        Unit not found
      </div>
    );

  }

  async function handleSubmit(
    data: Parameters<
      typeof updateUnitById
    >[1],
  ) {

    const unitId = unit?.id;

    if (!unitId) {
      return;
    }

    await updateUnitById(
      unitId,
      data,
    );

    navigate("/units");

  }

  return (

    <div className="p-6">

      <h1
        className="
          mb-6
          text-2xl
          font-bold
        "
      >
        Edit Unit
      </h1>

      <UnitForm
        defaultValues={{
          name:
            unit.name,
          symbol:
            unit.symbol,
          description:
            unit.description ??
            undefined,
        }}
        onSubmit={handleSubmit}
      />

    </div>

  );
}


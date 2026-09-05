/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Brands Page
 * ============================================================
 */

import {
  useEffect,
} from "react";

import {
  BrandToolbar,
} from "../components/BrandToolbar";

import {
  BrandTable,
} from "../components/BrandTable";

import {
  useBrands,
} from "../hooks/useBrands";

import {
  storeContext,
} from "../../../core/store/store.context";

export function BrandsPage() {

  const {
    brands,
    search,
    setSearch,
    loadBrands,
    deleteBrand,
  } = useBrands();

  const context =
    storeContext.getStore();

  const tenantId =
    context?.tenantId ?? "";

  const storeId =
    context?.storeId ?? "";

  useEffect(() => {

    if (!tenantId || !storeId) {
      return;
    }

    loadBrands(
      tenantId,
      storeId,
    );

  }, [
    loadBrands,
    tenantId,
    storeId,
  ]);

  const filteredBrands =
    brands.filter(
      (brand) =>
        brand.name
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );

  async function handleDelete(
    id: string,
  ) {

    if (!tenantId || !storeId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this brand?",
      );

    if (!confirmed) {
      return;
    }

    await deleteBrand(
      tenantId,
      storeId,
      id,
    );
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
        Brands
      </h1>

      <BrandToolbar
        search={search}
        onSearchChange={setSearch}
      />

      <BrandTable
        brands={filteredBrands}
        onDelete={handleDelete}
      />

    </div>
  );
}

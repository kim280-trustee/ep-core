import { useNavigate } from "react-router-dom";

import { BrandForm } from "../components/BrandForm";
import { brandService } from "../services/brand.service";
import type { CreateBrandDto } from "../types/brand.types";

import { storeContext } from "../../../core/store/store.context";

export function CreateBrandPage() {
  const navigate = useNavigate();

  async function handleSubmit(data: CreateBrandDto) {
    const context = storeContext.getStore();

    if (!context) {
      throw new Error("Store context is not initialized.");
    }

    await brandService.createBrand(
      data,
      context.tenantId,
      context.storeId
    );

    navigate("/brands");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Create Brand
      </h1>

      <BrandForm onSubmit={handleSubmit} />
    </div>
  );
}

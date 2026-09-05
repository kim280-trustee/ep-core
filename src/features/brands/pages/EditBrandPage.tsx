import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { BrandForm } from "../components/BrandForm";
import { brandService } from "../services/brand.service";
import type { Brand } from "../types/brand.types";

import { storeContext } from "../../../core/store/store.context";

export function EditBrandPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  const context = storeContext.getStore();

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!context || !id) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      const result = await brandService.getBrandById(
        context.tenantId,
        id
      );

      if (mounted) {
        setBrand(result);
        setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [context?.tenantId, id]);

  if (!context) {
    return (
      <div className="p-6">
        Store context is not initialized.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading brand...
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="p-6">
        Brand not found
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Edit Brand
      </h1>

      <BrandForm
        defaultValues={{
          name: brand.name,
          code: brand.code,
          description: brand.description,
          logoUrl: brand.logoUrl,
        }}
        onSubmit={async (data) => {
          await brandService.updateBrand(
            context.tenantId,
            context.storeId,
            brand.id,
            data
          );

          navigate("/brands");
        }}
      />
    </div>
  );
}

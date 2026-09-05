import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { CategoryForm } from "../components/CategoryForm";
import { categoryService } from "../services/category.service";

import type { Category } from "../types/category.types";

import { storeContext } from "../../../core/store/store.context";

export function EditCategoryPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const context = storeContext.getStore();

  const [category, setCategory] =
    useState<Category | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!context || !id) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      const result =
        await categoryService.getCategoryById(
          context.tenantId,
          id
        );

      if (mounted) {
        setCategory(result);
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
        Loading category...
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-6">
        Category not found
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Edit Category
      </h1>

      <CategoryForm
        defaultValues={{
          name: category.name,
          description: category.description,
        }}
        onSubmit={async (data) => {
          await categoryService.updateCategory(
            context.tenantId,
            context.storeId,
            category.id,
            {
              name: data.name,
              description: data.description,
            }
          );

          navigate("/categories");
        }}
      />
    </div>
  );
}

import {
  useNavigate,
} from "react-router-dom";

import {
  CategoryForm,
} from "../components/CategoryForm";

import {
  categoryService,
} from "../services/category.service";

import {
  storeContext,
} from "../../../core/store/store.context";

export function CreateCategoryPage() {
  const navigate = useNavigate();

  function handleSubmit(
    data: Parameters<
      typeof categoryService.createCategory
    >[0],
  ) {
    const context = storeContext.getStore();

    if (!context) {
      throw new Error(
        "Store context is not initialized.",
      );
    }

    categoryService.createCategory(
      data,
      context.tenantId,
      context.storeId,
    );

    navigate("/categories");
  }

  return (
    <div className="p-6">
      <h1
        className="
          text-2xl
          font-bold
          mb-6
        "
      >
        Create Category
      </h1>

      <CategoryForm
        onSubmit={handleSubmit}
      />
    </div>
  );
}

import {
  useNavigate,
  useParams,
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

export function EditCategoryPage() {
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();

  const context =
    storeContext.getStore();

  if (!context) {
    return (
      <div className="p-6">
        Store context is not initialized.
      </div>
    );
  }

  const tenantId =
    context.tenantId;

  const foundCategory =
    id
      ? categoryService.getCategoryById(
          tenantId,
          id,
        )
      : undefined;

  if (!foundCategory) {
    return (
      <div className="p-6">
        Category not found
      </div>
    );
  }

  const category =
    foundCategory;

  function handleSubmit(
    data: Parameters<
      typeof categoryService.createCategory
    >[0],
  ) {
    categoryService.updateCategory(
      tenantId,
      category.id,
      {
        name:
          data.name,

        description:
          data.description,
      },
    );

    navigate(
      "/categories",
    );
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
        Edit Category
      </h1>

      <CategoryForm
        defaultValues={{
          name:
            category.name,

          description:
            category.description,
        }}
        onSubmit={
          handleSubmit
        }
      />
    </div>
  );
}

/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Categories Page
 * ============================================================
 */

import {
  useEffect,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useCategoriesStore,
} from "../store/categories.store";

import {
  storeContext,
} from "../../../core/store/store.context";

export function CategoriesPage() {

  const navigate =
    useNavigate();

  const {
    categories,
    search,
    loadCategories,
    deleteCategory,
    setSearch,
  } =
    useCategoriesStore();

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

    loadCategories(
      tenantId,
      storeId,
    );

  }, [
    loadCategories,
    tenantId,
    storeId,
  ]);

  if (!context) {

    return (
      <div className="p-6">
        Store context is not initialized.
      </div>
    );

  }

  const filteredCategories =
    categories.filter(
      (category) => {

        const searchTerm =
          search.toLowerCase();

        return (
          category.name
            .toLowerCase()
            .includes(searchTerm)
          ||
          (
            category.description ??
            ""
          )
            .toLowerCase()
            .includes(searchTerm)
        );

      },
    );

  async function handleDelete(
    id: string,
  ) {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this category?",
      );

    if (!confirmed) {
      return;
    }

    await deleteCategory(
      tenantId,
      storeId,
      id,
    );

  }

  return (

    <div className="p-6">

      <div
        className="
          mb-6
          flex
          items-center
          justify-between
        "
      >

        <div>

          <h1
            className="
              text-2xl
              font-bold
              text-gray-900
            "
          >
            Categories
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-gray-500
            "
          >
            Manage your product categories.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/categories/create",
            )
          }
          className="
            rounded
            bg-blue-600
            px-4
            py-2
            text-sm
            font-medium
            text-white
            hover:bg-blue-700
          "
        >
          Add Category
        </button>

      </div>

      <div className="mb-6">

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          placeholder="Search categories..."
          className="
            w-full
            max-w-md
            rounded
            border
            border-gray-300
            px-4
            py-2
            outline-none
            focus:border-blue-500
            focus:ring-1
            focus:ring-blue-500
          "
        />

      </div>

      {filteredCategories.length === 0 ? (

        <div
          className="
            rounded-xl
            border
            bg-white
            p-8
            text-center
          "
        >

          <h2
            className="
              text-lg
              font-semibold
              text-gray-800
            "
          >
            No categories found
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
            "
          >
            Create a category to organize
            your products.
          </p>

        </div>

      ) : (

        <div
          className="
            overflow-hidden
            rounded-xl
            border
            bg-white
          "
        >

          <table
            className="
              w-full
              text-left
            "
          >

            <thead
              className="
                border-b
                bg-gray-50
              "
            >

              <tr>

                <th
                  className="
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-gray-700
                  "
                >
                  Name
                </th>

                <th
                  className="
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-gray-700
                  "
                >
                  Description
                </th>

                <th
                  className="
                    px-4
                    py-3
                    text-right
                    text-sm
                    font-semibold
                    text-gray-700
                  "
                >
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredCategories.map(
                (category) => (

                  <tr
                    key={category.id}
                    className="
                      border-b
                      last:border-b-0
                    "
                  >

                    <td
                      className="
                        px-4
                        py-3
                        font-medium
                        text-gray-900
                      "
                    >
                      {category.name}
                    </td>

                    <td
                      className="
                        px-4
                        py-3
                        text-gray-600
                      "
                    >
                      {
                        category.description ??
                        "—"
                      }
                    </td>

                    <td
                      className="
                        px-4
                        py-3
                        text-right
                      "
                    >

                      <div
                        className="
                          flex
                          justify-end
                          gap-2
                        "
                      >

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/categories/${category.id}/edit`,
                            )
                          }
                          className="
                            rounded
                            border
                            px-3
                            py-1.5
                            text-sm
                            text-gray-700
                            hover:bg-gray-50
                          "
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              category.id,
                            )
                          }
                          className="
                            rounded
                            border
                            border-red-200
                            px-3
                            py-1.5
                            text-sm
                            text-red-600
                            hover:bg-red-50
                          "
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ),
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );
}

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

  if (!context) {
    return (
      <div className="p-6">
        Store context is not initialized.
      </div>
    );
  }

  const tenantId =
    context.tenantId;

  useEffect(() => {
    loadCategories(
      tenantId,
    );
  }, [
    loadCategories,
    tenantId,
  ]);

  const filteredCategories =
    categories.filter(
      (category) =>
        category.name
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ) ||
        (
          category.description ??
          ""
        )
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );

  function handleDelete(
    id: string,
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this category?",
      );

    if (!confirmed) {
      return;
    }

    deleteCategory(
      tenantId,
      id,
    );
  }

  return (
    <div className="p-6">
      <div
        className="
          flex
          items-center
          justify-between
          mb-6
        "
      >
        <h1
          className="
            text-2xl
            font-bold
          "
        >
          Categories
        </h1>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/categories/create",
            )
          }
          className="
            bg-black
            text-white
            rounded
            px-4
            py-2
          "
        >
          Create Category
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
            border
            rounded
            p-2
            w-full
            max-w-md
          "
        />
      </div>

      <div
        className="
          border
          rounded
          overflow-hidden
        "
      >
        {filteredCategories.length ===
        0 ? (
          <div className="p-6">
            No categories found.
          </div>
        ) : (
          <table
            className="
              w-full
              border-collapse
            "
          >
            <thead>
              <tr
                className="
                  border-b
                  bg-gray-50
                "
              >
                <th className="text-left p-3">
                  Name
                </th>

                <th className="text-left p-3">
                  Description
                </th>

                <th className="text-left p-3">
                  Status
                </th>

                <th className="text-right p-3">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map(
                (category) => (
                  <tr
                    key={category.id}
                    className="border-b"
                  >
                    <td className="p-3">
                      {category.name}
                    </td>

                    <td className="p-3">
                      {
                        category.description ??
                        "-"
                      }
                    </td>

                    <td className="p-3">
                      {category.status}
                    </td>

                    <td
                      className="
                        p-3
                        text-right
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/categories/edit/${category.id}`,
                          )
                        }
                        className="
                          mr-3
                          underline
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
                        className="underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

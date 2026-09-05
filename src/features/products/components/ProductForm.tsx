/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Form
 * ============================================================
 */

import {
  useEffect,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  createProductSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "../schemas/product.schema";

import {
  ProductStatus,
  ProductType,
} from "../types/product.types";

import {
  useCategories,
} from "@/features/categories";

import {
  useBrands,
} from "@/features/brands";

import {
  useUnits,
} from "@/features/units";

import {
  storeContext,
} from "@/core/store/store.context";


interface ProductFormProps {

  defaultValues?:
    Partial<ProductFormInput>;

  onSubmit?:
    (values: ProductFormValues) => void;

  loading?:
    boolean;
}


export function ProductForm({

  defaultValues,

  onSubmit =
    () => {},

  loading =
    false,

}: ProductFormProps) {


  const {

    register,

    handleSubmit,

    formState: {
      errors,
    },

  } =
    useForm<
      ProductFormInput,
      undefined,
      ProductFormValues
    >({

      resolver:
        zodResolver(
          createProductSchema,
        ),

      defaultValues: {

        name:
          "",

        sku:
          "",

        currency:
          "THB",

        productType:
          ProductType.PRODUCT,

        status:
          ProductStatus.ACTIVE,

        trackInventory:
          true,

        costPrice:
          0,

        sellingPrice:
          0,

        ...defaultValues,

      },

    });


  const {
    categories,
    loadCategories,
  } =
    useCategories();

  const {
    brands,
    loadBrands,
  } =
    useBrands();

  const {
    units,
  } =
    useUnits();


  useEffect(() => {

    const context =
      storeContext.getStore();

    const tenantId =
      context?.tenantId ?? "";

    const storeId =
      context?.storeId ?? "";

    if (!tenantId || !storeId) {
      return;
    }

    void loadCategories(
      tenantId,
      storeId,
    );

    void loadBrands(
      tenantId,
      storeId,
    );

  }, [
    loadCategories,
    loadBrands,
  ]);


  return (

    <form

      onSubmit={
        handleSubmit(
          onSubmit,
        )
      }

      className="
        space-y-5
        rounded-xl
        border
        bg-white
        p-6
      "

    >


      {/* Product Name */}

      <div>

        <label
          className="
            mb-1
            block
            text-sm
            font-medium
            text-gray-700
          "
        >
          Product Name
        </label>


        <input

          {...register(
            "name",
          )}

          placeholder="
            Product Name
          "

          className="
            w-full
            rounded
            border
            p-2
          "

        />


        {errors.name && (

          <p
            className="
              mt-1
              text-sm
              text-red-600
            "
          >

            {errors.name.message}

          </p>

        )}

      </div>


      {/* SKU */}

      <div>

        <label
          className="
            mb-1
            block
            text-sm
            font-medium
            text-gray-700
          "
        >
          SKU
        </label>


        <input

          {...register(
            "sku",
          )}

          placeholder="
            SKU
          "

          className="
            w-full
            rounded
            border
            p-2
          "

        />


        {errors.sku && (

          <p
            className="
              mt-1
              text-sm
              text-red-600
            "
          >

            {errors.sku.message}

          </p>

        )}

      </div>


      {/* Category */}

      <div>

        <label
          className="
            mb-1
            block
            text-sm
            font-medium
            text-gray-700
          "
        >
          Category
        </label>

        <select

          {...register(
            "categoryId",
          )}

          className="
            w-full
            rounded
            border
            p-2
          "

        >

          <option value="">
            Select category
          </option>

          {categories
            .filter(
              (category) =>
                category.status === "active",
            )
            .map(
              (category) => (

                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>

              ),
            )}

        </select>

        {errors.categoryId && (

          <p
            className="
              mt-1
              text-sm
              text-red-600
            "
          >
            {errors.categoryId.message}
          </p>

        )}

      </div>


      {/* Brand */}

      <div>

        <label
          className="
            mb-1
            block
            text-sm
            font-medium
            text-gray-700
          "
        >
          Brand
        </label>

        <select

          {...register(
            "brandId",
          )}

          className="
            w-full
            rounded
            border
            p-2
          "

        >

          <option value="">
            Select brand
          </option>

          {brands
            .filter(
              (brand) =>
                brand.status === "active",
            )
            .map(
              (brand) => (

                <option
                  key={brand.id}
                  value={brand.id}
                >
                  {brand.name}
                </option>

              ),
            )}

        </select>

        {errors.brandId && (

          <p
            className="
              mt-1
              text-sm
              text-red-600
            "
          >
            {errors.brandId.message}
          </p>

        )}

      </div>


      {/* Unit */}

      <div>

        <label
          className="
            mb-1
            block
            text-sm
            font-medium
            text-gray-700
          "
        >
          Unit
        </label>

        <select

          {...register(
            "unitId",
          )}

          className="
            w-full
            rounded
            border
            p-2
          "

        >

          <option value="">
            Select unit
          </option>

          {units
            .filter(
              (unit) =>
                unit.status === "active",
            )
            .map(
              (unit) => (

                <option
                  key={unit.id}
                  value={unit.id}
                >
                  {unit.name} ({unit.symbol})
                </option>

              ),
            )}

        </select>

        {errors.unitId && (

          <p
            className="
              mt-1
              text-sm
              text-red-600
            "
          >
            {errors.unitId.message}
          </p>

        )}

      </div>


      {/* Currency */}

      <div>

        <label
          className="
            mb-1
            block
            text-sm
            font-medium
            text-gray-700
          "
        >
          Currency
        </label>


        <input

          {...register(
            "currency",
          )}

          placeholder="
            Currency
          "

          className="
            w-full
            rounded
            border
            p-2
          "

        />


        {errors.currency && (

          <p
            className="
              mt-1
              text-sm
              text-red-600
            "
          >

            {errors.currency.message}

          </p>

        )}

      </div>


      {/* Barcode */}

      <div>

        <label
          className="
            mb-1
            block
            text-sm
            font-medium
            text-gray-700
          "
        >
          Barcode
        </label>


        <input

          {...register(
            "barcode",
          )}

          placeholder="
            Barcode
          "

          className="
            w-full
            rounded
            border
            p-2
          "

        />

      </div>


      {/* Cost Price */}

      <div>

        <label
          className="
            mb-1
            block
            text-sm
            font-medium
            text-gray-700
          "
        >
          Cost Price
        </label>


        <input

          type="number"

          step="0.01"

          {...register(
            "costPrice",
            {
              valueAsNumber:
                true,
            },
          )}

          placeholder="
            Enter cost price
          "

          className="
            w-full
            rounded
            border
            p-2
          "

        />


        {errors.costPrice && (

          <p
            className="
              mt-1
              text-sm
              text-red-600
            "
          >

            {errors.costPrice.message}

          </p>

        )}

      </div>


      {/* Selling Price */}

      <div>

        <label
          className="
            mb-1
            block
            text-sm
            font-medium
            text-gray-700
          "
        >
          Selling Price
        </label>


        <input

          type="number"

          step="0.01"

          {...register(
            "sellingPrice",
            {
              valueAsNumber:
                true,
            },
          )}

          placeholder="
            Enter selling price
          "

          className="
            w-full
            rounded
            border
            p-2
          "

        />


        {errors.sellingPrice && (

          <p
            className="
              mt-1
              text-sm
              text-red-600
            "
          >

            {errors.sellingPrice.message}

          </p>

        )}

      </div>


      {/* Description */}

      <div>

        <label
          className="
            mb-1
            block
            text-sm
            font-medium
            text-gray-700
          "
        >
          Description
        </label>


        <textarea

          {...register(
            "description",
          )}

          placeholder="
            Description
          "

          className="
            w-full
            rounded
            border
            p-2
          "

        />

      </div>


      {/* Track Inventory */}

      <label
        className="
          flex
          items-center
          gap-2
        "
      >

        <input

          type="checkbox"

          {...register(
            "trackInventory",
          )}

        />


        <span
          className="
            text-sm
            font-medium
            text-gray-700
          "
        >
          Track Inventory
        </span>

      </label>


      {/* Submit */}

      <button

        type="submit"

        disabled={
          loading
        }

        className="
          rounded
          bg-blue-600
          px-5
          py-2
          text-white
          hover:bg-blue-700
          disabled:cursor-not-allowed
          disabled:opacity-50
        "

      >

        {
          loading
            ? "Saving..."
            : "Save Product"
        }

      </button>


    </form>

  );
}

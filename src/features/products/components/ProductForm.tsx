/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Form
 * ============================================================
 */

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
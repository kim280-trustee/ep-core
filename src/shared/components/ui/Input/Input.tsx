import type { InputProps } from "./Input.types";

export function Input({
  label,
  error,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId =
    id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`
          rounded-lg
          border
          px-3
          py-2
          outline-none
          transition

          placeholder:text-gray-400

          focus:ring-2
          focus:ring-blue-500

          disabled:cursor-not-allowed
          disabled:bg-gray-100

          ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }

          ${className}
        `}
        {...props}
      />

      {error && (
        <span className="text-sm text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
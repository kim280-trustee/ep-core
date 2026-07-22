import type { ButtonProps } from "./Button.types";

const variants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700",
  secondary:
    "bg-gray-200 text-gray-900 hover:bg-gray-300",
  danger:
    "bg-red-600 text-white hover:bg-red-700",
  ghost:
    "bg-transparent hover:bg-gray-100",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        px-4
        py-2
        rounded-lg
        font-medium
        transition
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
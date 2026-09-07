import type { ButtonProps } from "./Button.types";

const variants = {
  primary:
    "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500",
  secondary:
    "border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus-visible:ring-gray-400",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400",
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
        inline-flex
        min-h-10
        items-center
        justify-center
        gap-2
        rounded-lg
        px-4
        py-2
        text-sm
        font-semibold
        transition-colors
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

import type { CardProps } from "./Card.types";

export function Card({
  title,
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
        ${className}
      `}
      {...props}
    >
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          {title}
        </h3>
      )}

      {children}
    </div>
  );
}
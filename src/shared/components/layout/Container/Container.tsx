import type { ContainerProps } from "./Container.types";

const sizes = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

export function Container({
  size = "xl",
  children,
  className = "",
  ...props
}: ContainerProps) {
  return (
    <div
      className={`
        mx-auto
        w-full
        px-4
        sm:px-6
        lg:px-8
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
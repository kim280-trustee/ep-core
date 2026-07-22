import type { HTMLAttributes } from "react";

export interface ContainerProps
  extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}
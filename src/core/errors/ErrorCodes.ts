export const ErrorCodes = {
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;

export type ErrorCode =
  (typeof ErrorCodes)[keyof typeof ErrorCodes];
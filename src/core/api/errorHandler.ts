export class ApiError extends Error {
  status?: number;

  constructor(
    message: string,
    status?: number,
  ) {
    super(message);

    this.name =
      "ApiError";

    this.status =
      status;
  }
}

export function handleApiError(
  error: unknown,
) {
  if (
    error instanceof ApiError
  ) {
    return error.message;
  }

  return "Something went wrong";
}
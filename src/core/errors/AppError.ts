export class AppError extends Error {

  public readonly code: string;

  public readonly details?: unknown;

  public readonly cause?: unknown;



  constructor(

    message: string,

    code = "UNKNOWN_ERROR",

    details?: unknown,

    cause?: unknown,

  ) {

    super(message);

    this.name = "AppError";

    this.code = code;

    this.details = details;

    this.cause = cause;

  }

}
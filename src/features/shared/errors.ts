export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function assertNonEmpty(value: unknown, field: string) {
  const str = String(value ?? "").trim();
  if (!str) throw new AppError("VALIDATION_ERROR", `${field} is required`, 400);
  return str;
}

export function toErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      body: {
        error: {
          code: error.code,
          message: error.message
        }
      },
      status: error.status
    };
  }

  return {
    body: {
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong"
      }
    },
    status: 500
  };
}

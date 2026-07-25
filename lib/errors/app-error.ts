export type AppErrorCode =
  | "AUTH_REQUIRED"
  | "FAMILY_NOT_FOUND"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly details?: unknown;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    code: AppErrorCode = "UNKNOWN_ERROR",
    details?: unknown,
    originalError?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
    this.originalError = originalError;

    // Preserve stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export function parseSupabaseError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    const errObj = error as { code?: string; message?: string; details?: string };
    const pgCode = errObj.code;
    const rawMessage = errObj.message || "";

    // 0 rows returned -> FAMILY_NOT_FOUND / Record Not Found
    if (pgCode === "PGRST116" || rawMessage.includes("0 rows")) {
      return new AppError("Família não encontrada para o usuário.", "FAMILY_NOT_FOUND", null, error);
    }

    if (pgCode === "PGRST301" || rawMessage.includes("JWT")) {
      return new AppError("Sessão expirada. Faça login novamente.", "AUTH_REQUIRED", null, error);
    }

    if (pgCode === "42501" || rawMessage.includes("permission denied")) {
      return new AppError("Acesso negado para esta operação.", "PERMISSION_DENIED", null, error);
    }

    if (pgCode === "23505") {
      return new AppError("Já existe um registro com estes dados.", "VALIDATION_ERROR", null, error);
    }

    if (pgCode === "23503") {
      return new AppError("Operação não permitida: registro vinculado a outros dados.", "VALIDATION_ERROR", null, error);
    }

    if (rawMessage.includes("FetchError") || rawMessage.includes("Failed to fetch")) {
      return new AppError("Falha de conexão com a rede. Verifique sua internet.", "NETWORK_ERROR", null, error);
    }

    return new AppError(
      "Ocorreu um erro ao processar sua solicitação no banco de dados.",
      "DATABASE_ERROR",
      null,
      error
    );
  }

  return new AppError("Ocorreu um erro inesperado no aplicativo.", "UNKNOWN_ERROR", null, error);
}

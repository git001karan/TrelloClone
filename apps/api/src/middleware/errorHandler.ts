import { Request, Response, NextFunction } from "express";

// ─────────────────────────────────────────────────────
// CUSTOM ERROR CLASS HIERARCHY
// Each error type maps to a specific HTTP status code.
// Services throw these; the global handler catches them.
// ─────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/** 404 — Resource not found */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with ID '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, "NOT_FOUND");
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/** 403 — Insufficient permissions */
export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403, "FORBIDDEN");
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/** 401 — Authentication required or invalid */
export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/** 409 — Resource conflict (duplicate) */
export class ConflictError extends AppError {
  constructor(message = "A resource with this value already exists") {
    super(message, 409, "CONFLICT");
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/** 400 — Bad request / validation error */
export class ValidationError extends AppError {
  public readonly details?: Record<string, string[]>;

  constructor(message = "Validation failed", details?: Record<string, string[]>) {
    super(message, 400, "VALIDATION_ERROR");
    this.details = details;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

// ─────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER MIDDLEWARE
// Catches all errors thrown in routes/services and maps
// them to a consistent JSON response envelope.
// ─────────────────────────────────────────────────────

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", {
      name: err.name,
      message: err.message,
      stack: err.stack?.split("\n").slice(0, 5).join("\n"),
    });
  }

  // ─── Custom Application Errors ───────────────────
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  // ─── Prisma Errors ──────────────────────────────
  if (err.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as any;

    const prismaErrorMap: Record<string, { status: number; message: string; code: string }> = {
      P2002: { status: 409, message: "A record with this value already exists", code: "DUPLICATE_ENTRY" },
      P2003: { status: 400, message: "Related record not found — check foreign key references", code: "FOREIGN_KEY_VIOLATION" },
      P2025: { status: 404, message: "Record not found", code: "NOT_FOUND" },
    };

    const mapped = prismaErrorMap[prismaErr.code];
    if (mapped) {
      res.status(mapped.status).json({
        success: false,
        error: mapped.message,
        code: mapped.code,
      });
      return;
    }
  }

  if (err.name === "PrismaClientValidationError") {
    res.status(400).json({
      success: false,
      error: "Invalid data provided to database query",
      code: "DB_VALIDATION_ERROR",
    });
    return;
  }

  // ─── Zod Validation Errors ──────────────────────
  if (err.name === "ZodError") {
    const zodErr = err as any;
    res.status(400).json({
      success: false,
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: zodErr.flatten?.().fieldErrors,
    });
    return;
  }

  // ─── JWT Errors ─────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      error: "Invalid token",
      code: "INVALID_TOKEN",
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      error: "Token has expired",
      code: "TOKEN_EXPIRED",
    });
    return;
  }

  // ─── Unknown / Unhandled Errors ─────────────────
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    code: "INTERNAL_ERROR",
  });
}

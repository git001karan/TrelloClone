import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError, AppError } from "./errorHandler";

export interface AuthPayload {
  userId: string;
  email: string;
}

// Extend Express Request to include auth data
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * JWT authentication middleware.
 * Verifies the Bearer token from the Authorization header
 * and attaches the decoded user payload to req.user.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or malformed authorization header");
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new AppError("JWT secret not configured", 500, "CONFIG_ERROR", false);
    }

    const decoded = jwt.verify(token, secret) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    // JWT library errors (JsonWebTokenError, TokenExpiredError)
    // will be caught by the global error handler
    next(error);
  }
}

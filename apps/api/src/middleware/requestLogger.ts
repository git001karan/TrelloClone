import { Request, Response, NextFunction } from "express";

/**
 * Request logging middleware for development.
 * Logs method, URL, status code, and response time for every request.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl } = req;

  // Log on response finish
  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusIcon = status >= 400 ? "🔴" : status >= 300 ? "🟡" : "🟢";

    console.log(
      `${statusIcon} ${method.padEnd(7)} ${originalUrl.padEnd(40)} ${status}  ${duration}ms`
    );
  });

  next();
}

import { Request, Response, NextFunction } from "express";

/**
 * Wraps an async Express route handler to automatically catch errors
 * and forward them to the global error handler via next().
 *
 * Eliminates the need for try/catch blocks in every controller method.
 *
 * Usage:
 *   router.get("/boards", asyncHandler(boardController.getBoards));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

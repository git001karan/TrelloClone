import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { userRepository } from "../repositories/user.repository";
import { NotFoundError } from "../middleware/errorHandler";

/**
 * Auth Controller — HTTP request handling for authentication.
 * Uses asyncHandler wrapper (no try/catch needed).
 */
export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  },

  async me(req: Request, res: Response) {
    const user = await userRepository.findById(req.user!.userId);
    if (!user) {
      throw new NotFoundError("User", req.user!.userId);
    }
    res.json({ success: true, data: user });
  },
};

import { Request, Response } from "express";
import { boardService } from "../services/board.service";

/**
 * Board Controller — HTTP request handling for boards.
 * Uses asyncHandler wrapper (no try/catch needed — errors auto-forwarded).
 */
export const boardController = {
  async getBoard(req: Request, res: Response) {
    const board = await boardService.getBoard(String(req.params.id), req.user!.userId);
    res.json({ success: true, data: board });
  },

  async getUserBoards(req: Request, res: Response) {
    const boards = await boardService.getUserBoards(req.user!.userId);
    res.json({ success: true, data: boards });
  },

  async createBoard(req: Request, res: Response) {
    const board = await boardService.createBoard(req.body, req.user!.userId);
    res.status(201).json({ success: true, data: board });
  },

  async updateBoard(req: Request, res: Response) {
    const board = await boardService.updateBoard(String(req.params.id), req.body, req.user!.userId);
    res.json({ success: true, data: board });
  },

  async deleteBoard(req: Request, res: Response) {
    await boardService.deleteBoard(String(req.params.id), req.user!.userId);
    res.json({ success: true, data: null, message: "Board deleted successfully" });
  },
};

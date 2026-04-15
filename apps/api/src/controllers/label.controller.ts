import { Request, Response } from "express";
import { labelService } from "../services/label.service";

/**
 * Label Controller — HTTP request handling for labels.
 * Uses asyncHandler wrapper (no try/catch needed).
 */
export const labelController = {
  async getLabelsByBoard(req: Request, res: Response) {
    const labels = await labelService.getLabelsByBoard(String(req.params.boardId), req.user!.userId);
    res.json({ success: true, data: labels });
  },

  async createLabel(req: Request, res: Response) {
    const label = await labelService.createLabel(req.body, req.user!.userId);
    res.status(201).json({ success: true, data: label });
  },

  async updateLabel(req: Request, res: Response) {
    const label = await labelService.updateLabel(String(req.params.id), req.body, req.user!.userId);
    res.json({ success: true, data: label });
  },

  async deleteLabel(req: Request, res: Response) {
    await labelService.deleteLabel(String(req.params.id), req.user!.userId);
    res.json({ success: true, data: null, message: "Label deleted" });
  },
};

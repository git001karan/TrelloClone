import { Request, Response } from "express";
import { listService } from "../services/list.service";

/**
 * List Controller — HTTP request handling for lists.
 * Uses asyncHandler wrapper (no try/catch needed).
 */
export const listController = {
  async getListsByBoard(req: Request, res: Response) {
    const lists = await listService.getListsByBoard(String(req.params.boardId), req.user!.userId);
    res.json({ success: true, data: lists });
  },

  async createList(req: Request, res: Response) {
    const list = await listService.createList(req.body, req.user!.userId);
    res.status(201).json({ success: true, data: list });
  },

  async updateList(req: Request, res: Response) {
    const list = await listService.updateList(String(req.params.id), req.body, req.user!.userId);
    res.json({ success: true, data: list });
  },

  async moveList(req: Request, res: Response) {
    const list = await listService.moveList(String(req.params.id), req.body, req.user!.userId);
    res.json({ success: true, data: list });
  },

  async archiveList(req: Request, res: Response) {
    const list = await listService.archiveList(String(req.params.id), req.user!.userId);
    res.json({ success: true, data: list, message: "List archived" });
  },
};

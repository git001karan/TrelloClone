import { Request, Response } from "express";
import { cardService } from "../services/card.service";
import { io } from "../server";

export const cardController = {
  async getCard(req: Request, res: Response) {
    const card = await cardService.getCard(String(req.params.id), req.user!.userId);
    res.json({ success: true, data: card });
  },

  async createCard(req: Request, res: Response) {
    const card = await cardService.createCard(req.body, req.user!.userId);
    res.status(201).json({ success: true, data: card });
  },

  async updateCard(req: Request, res: Response) {
    const card = await cardService.updateCard(String(req.params.id), req.body, req.user!.userId);
    // Emit to all clients on this board
    if (card && (card as any).list?.boardId) {
      io.to(`board:${(card as any).list.boardId}`).emit("card-updated", card);
    }
    res.json({ success: true, data: card });
  },

  async moveCard(req: Request, res: Response) {
    const card = await cardService.moveCard(String(req.params.id), req.body, req.user!.userId);
    if (card && (card as any).list?.boardId) {
      io.to(`board:${(card as any).list.boardId}`).emit("card-moved", card);
    }
    res.json({ success: true, data: card });
  },

  async archiveCard(req: Request, res: Response) {
    const card = await cardService.archiveCard(String(req.params.id), req.user!.userId);
    res.json({ success: true, data: card, message: "Card archived" });
  },

  async deleteCard(req: Request, res: Response) {
    await cardService.deleteCard(String(req.params.id), req.user!.userId);
    res.json({ success: true, data: null, message: "Card deleted" });
  },

  async addLabel(req: Request, res: Response) {
    const card = await cardService.addLabel(
      String(req.params.id),
      String(req.params.labelId),
      req.user!.userId
    );
    res.json({ success: true, data: card });
  },

  async removeLabel(req: Request, res: Response) {
    const card = await cardService.removeLabel(
      String(req.params.id),
      String(req.params.labelId),
      req.user!.userId
    );
    res.json({ success: true, data: card });
  },
};

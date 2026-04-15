import { Request, Response } from "express";
import { activityService } from "../services/activity.service";

/**
 * Activity Controller — HTTP request handling for activity feeds.
 * The "Pro" feature — provides human-readable activity history.
 */
export const activityController = {
  /**
   * GET /api/activity/board/:boardId
   * Returns the full activity feed for a board with human-readable descriptions.
   */
  async getBoardActivity(req: Request, res: Response) {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const activities = await activityService.getBoardActivity(
      String(req.params.boardId),
      req.user!.userId,
      limit
    );
    res.json({ success: true, data: activities });
  },

  /**
   * GET /api/activity/card/:cardId
   * Returns the activity feed for a specific card.
   */
  async getCardActivity(req: Request, res: Response) {
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 100);
    const activities = await activityService.getCardActivity(
      String(req.params.cardId),
      req.user!.userId,
      limit
    );
    res.json({ success: true, data: activities });
  },

  /**
   * GET /api/activity/me
   * Returns the current user's activity feed across all boards.
   */
  async getUserActivity(req: Request, res: Response) {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const activities = await activityService.getUserActivity(
      req.user!.userId,
      limit
    );
    res.json({ success: true, data: activities });
  },
};

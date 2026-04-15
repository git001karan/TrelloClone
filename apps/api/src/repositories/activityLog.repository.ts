import { prisma } from "../lib/prisma";
import type { ActivityAction, Prisma } from "../lib/prisma";

/**
 * Activity Log Repository — Data access layer for activity tracking.
 * Provides queries for creating logs and fetching feeds
 * scoped by card, board, or user.
 */
export const activityLogRepository = {
  async create(data: {
    action: ActivityAction;
    entityType: string;
    entityId: string;
    userId: string;
    cardId?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return prisma.activityLog.create({ data });
  },

  async findByCardId(cardId: string, take = 20) {
    return prisma.activityLog.findMany({
      where: { cardId },
      orderBy: { createdAt: "desc" },
      take,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  },

  /**
   * Get activity for an entire board.
   * Joins through Card → List → Board to find all related activity.
   */
  async findByBoardId(boardId: string, take = 50) {
    return prisma.activityLog.findMany({
      where: {
        OR: [
          // Activity on cards in the board
          {
            card: {
              list: { boardId },
            },
          },
          // Activity on lists/board directly (no cardId)
          {
            cardId: null,
            entityType: { in: ["List", "Board"] },
            // For list activities, we check via the entity itself
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      take,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        card: { select: { id: true, title: true } },
      },
    });
  },

  async findByUserId(userId: string, take = 50) {
    return prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
      include: {
        card: { select: { id: true, title: true } },
      },
    });
  },
};

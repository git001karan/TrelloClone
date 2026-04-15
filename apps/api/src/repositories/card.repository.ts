import { prisma } from "../lib/prisma";
import type { Prisma } from "../lib/prisma";

/**
 * Card Repository — Data access layer for cards.
 * Handles all Prisma queries for Card entities, including position-based operations.
 */
export const cardRepository = {
  async findById(id: string) {
    return prisma.card.findUnique({
      where: { id },
      include: {
        list: { select: { id: true, title: true, boardId: true } },
        labels: { include: { label: true } },
        assignees: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });
  },

  async findAllByListId(listId: string) {
    return prisma.card.findMany({
      where: { listId, isArchived: false },
      orderBy: { position: "asc" },
      include: {
        labels: { include: { label: true } },
        assignees: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        _count: { select: { activityLogs: true } },
      },
    });
  },

  /**
   * Get all positions for cards in a list (sorted).
   * Used for rebalancing checks.
   */
  async getPositions(listId: string): Promise<number[]> {
    const cards = await prisma.card.findMany({
      where: { listId, isArchived: false },
      select: { position: true },
      orderBy: { position: "asc" },
    });
    return cards.map((c) => c.position);
  },

  /**
   * Get the maximum position value in a list's cards.
   * Returns null if no cards exist.
   */
  async getMaxPosition(listId: string): Promise<number | null> {
    const result = await prisma.card.aggregate({
      where: { listId, isArchived: false },
      _max: { position: true },
    });
    return result._max.position;
  },

  async create(data: Prisma.CardCreateInput) {
    return prisma.card.create({
      data,
      include: {
        labels: { include: { label: true } },
        list: { select: { id: true, title: true, boardId: true } },
      },
    });
  },

  async update(id: string, data: Prisma.CardUpdateInput) {
    return prisma.card.update({
      where: { id },
      data,
      include: {
        labels: { include: { label: true } },
        assignees: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });
  },

  /**
   * Move a card to a new list and/or position.
   * This is the core operation for drag-and-drop.
   */
  async move(id: string, listId: string, position: number) {
    return prisma.card.update({
      where: { id },
      data: { listId, position },
    });
  },

  async archive(id: string) {
    return prisma.card.update({
      where: { id },
      data: { isArchived: true },
    });
  },

  async delete(id: string) {
    return prisma.card.delete({ where: { id } });
  },

  /**
   * Rebalance all card positions in a list.
   */
  async rebalancePositions(listId: string, gap: number) {
    const cards = await prisma.card.findMany({
      where: { listId, isArchived: false },
      orderBy: { position: "asc" },
      select: { id: true },
    });

    const updates = cards.map((card, index) =>
      prisma.card.update({
        where: { id: card.id },
        data: { position: (index + 1) * gap },
      })
    );

    return prisma.$transaction(updates);
  },

  // ─── Label Operations ──────────────────────────────
  async addLabel(cardId: string, labelId: string) {
    return prisma.cardLabel.create({
      data: { cardId, labelId },
    });
  },

  async removeLabel(cardId: string, labelId: string) {
    return prisma.cardLabel.delete({
      where: { cardId_labelId: { cardId, labelId } },
    });
  },

  // ─── Assignee Operations ───────────────────────────
  async addAssignee(cardId: string, userId: string) {
    return prisma.cardAssignee.create({
      data: { cardId, userId },
    });
  },

  async removeAssignee(cardId: string, userId: string) {
    return prisma.cardAssignee.delete({
      where: { cardId_userId: { cardId, userId } },
    });
  },
};

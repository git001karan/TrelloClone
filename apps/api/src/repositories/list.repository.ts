import { prisma } from "@trello-clone/database";
import type { Prisma } from "@trello-clone/database";

/**
 * List Repository — Data access layer for lists.
 * Handles all Prisma queries for List entities, including position-based operations.
 */
export const listRepository = {
  async findById(id: string) {
    return prisma.list.findUnique({
      where: { id },
      include: {
        cards: {
          where: { isArchived: false },
          orderBy: { position: "asc" },
        },
      },
    });
  },

  async findAllByBoardId(boardId: string) {
    return prisma.list.findMany({
      where: { boardId, isArchived: false },
      orderBy: { position: "asc" },
      include: {
        cards: {
          where: { isArchived: false },
          orderBy: { position: "asc" },
          include: {
            labels: { include: { label: true } },
            assignees: {
              include: {
                user: { select: { id: true, name: true, avatarUrl: true } },
              },
            },
          },
        },
        _count: { select: { cards: true } },
      },
    });
  },

  /**
   * Get all positions for lists in a board (sorted).
   * Used for rebalancing checks.
   */
  async getPositions(boardId: string): Promise<number[]> {
    const lists = await prisma.list.findMany({
      where: { boardId, isArchived: false },
      select: { position: true },
      orderBy: { position: "asc" },
    });
    return lists.map((l) => l.position);
  },

  /**
   * Get the maximum position value in a board's lists.
   * Returns null if no lists exist.
   */
  async getMaxPosition(boardId: string): Promise<number | null> {
    const result = await prisma.list.aggregate({
      where: { boardId, isArchived: false },
      _max: { position: true },
    });
    return result._max.position;
  },

  async create(data: Prisma.ListCreateInput) {
    return prisma.list.create({ data });
  },

  async update(id: string, data: Prisma.ListUpdateInput) {
    return prisma.list.update({ where: { id }, data });
  },

  async archive(id: string) {
    return prisma.list.update({
      where: { id },
      data: { isArchived: true },
    });
  },

  async delete(id: string) {
    return prisma.list.delete({ where: { id } });
  },

  /**
   * Rebalance all list positions in a board.
   * Resets positions to evenly spaced values: 1000, 2000, 3000, ...
   */
  async rebalancePositions(boardId: string, gap: number) {
    const lists = await prisma.list.findMany({
      where: { boardId, isArchived: false },
      orderBy: { position: "asc" },
      select: { id: true },
    });

    const updates = lists.map((list, index) =>
      prisma.list.update({
        where: { id: list.id },
        data: { position: (index + 1) * gap },
      })
    );

    return prisma.$transaction(updates);
  },
};

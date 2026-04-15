import { prisma } from "@trello-clone/database";
import type { Prisma } from "@trello-clone/database";

/**
 * Label Repository — Data access layer for labels.
 */
export const labelRepository = {
  async findById(id: string) {
    return prisma.label.findUnique({
      where: { id },
      include: { _count: { select: { cards: true } } },
    });
  },

  async findAllByBoardId(boardId: string) {
    return prisma.label.findMany({
      where: { boardId },
      include: { _count: { select: { cards: true } } },
      orderBy: { name: "asc" },
    });
  },

  async create(data: Prisma.LabelCreateInput) {
    return prisma.label.create({ data });
  },

  async update(id: string, data: Prisma.LabelUpdateInput) {
    return prisma.label.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.label.delete({ where: { id } });
  },
};

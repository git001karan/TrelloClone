import { prisma } from "../lib/prisma";
import type { Prisma } from "../lib/prisma";

/**
 * Board Repository — Data access layer for boards.
 * All Prisma queries for the Board entity live here.
 */
export const boardRepository = {
  async findById(id: string) {
    return prisma.board.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
        labels: true,
        _count: { select: { lists: true } },
      },
    });
  },

  async findByIdWithLists(id: string) {
    return prisma.board.findUnique({
      where: { id },
      include: {
        lists: {
          where: { isArchived: false },
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
                _count: { select: { activityLogs: true } },
              },
            },
          },
        },
        labels: true,
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
      },
    });
  },

  async findAllByUserId(userId: string) {
    return prisma.board.findMany({
      where: {
        OR: [
          { createdById: userId },
          { members: { some: { userId } } },
        ],
        isClosed: false,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { lists: true, members: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  },

  async create(data: Prisma.BoardCreateInput) {
    return prisma.board.create({
      data,
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
  },

  async update(id: string, data: Prisma.BoardUpdateInput) {
    return prisma.board.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.board.delete({ where: { id } });
  },

  async isMember(boardId: string, userId: string) {
    const member = await prisma.boardMember.findUnique({
      where: { userId_boardId: { userId, boardId } },
    });
    return !!member;
  },

  async addMember(boardId: string, userId: string, role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER" = "MEMBER") {
    return prisma.boardMember.create({
      data: { boardId, userId, role },
    });
  },
};

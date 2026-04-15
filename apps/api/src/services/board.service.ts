import { boardRepository } from "../repositories/board.repository";
import { activityService } from "./activity.service";
import { NotFoundError, ForbiddenError } from "../middleware/errorHandler";
import type { CreateBoardDto, UpdateBoardDto } from "@trello-clone/shared";
import { DEFAULT_LABELS } from "@trello-clone/shared";
import { prisma } from "@trello-clone/database";

/**
 * Board Service — Business logic for board operations.
 * Orchestrates repository calls, enforces access control,
 * and handles board creation with default labels.
 */
export const boardService = {
  async getBoard(boardId: string, userId: string) {
    const board = await boardRepository.findByIdWithLists(boardId);
    if (!board) {
      throw new NotFoundError("Board", boardId);
    }

    // Check access — must be a member or the creator
    const isMember = board.members.some((m) => m.userId === userId);
    const isCreator = board.createdById === userId;
    if (!isMember && !isCreator) {
      throw new ForbiddenError("You don't have access to this board");
    }

    return board;
  },

  async getUserBoards(userId: string) {
    return boardRepository.findAllByUserId(userId);
  },

  /**
   * Create a new board with default labels and OWNER membership.
   * Uses a Prisma interactive transaction for atomicity.
   */
  async createBoard(data: CreateBoardDto, userId: string) {
    const board = await prisma.$transaction(async (tx) => {
      // Create the board
      const newBoard = await tx.board.create({
        data: {
          title: data.title,
          description: data.description,
          background: data.background || "#1e40af",
          createdBy: { connect: { id: userId } },
        },
      });

      // Add creator as OWNER
      await tx.boardMember.create({
        data: {
          boardId: newBoard.id,
          userId: userId,
          role: "OWNER",
        },
      });

      // Create default labels
      await tx.label.createMany({
        data: DEFAULT_LABELS.map((label) => ({
          ...label,
          boardId: newBoard.id,
        })),
      });

      // Return full board with includes
      return tx.board.findUnique({
        where: { id: newBoard.id },
        include: {
          createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
          },
          labels: true,
        },
      });
    });

    return board;
  },

  async updateBoard(boardId: string, data: UpdateBoardDto, userId: string) {
    const board = await boardRepository.findById(boardId);
    if (!board) {
      throw new NotFoundError("Board", boardId);
    }

    // Only OWNER and ADMIN can update
    const member = board.members.find((m) => m.userId === userId);
    if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
      throw new ForbiddenError("Only board owners and admins can update board settings");
    }

    return boardRepository.update(boardId, data);
  },

  async deleteBoard(boardId: string, userId: string) {
    const board = await boardRepository.findById(boardId);
    if (!board) {
      throw new NotFoundError("Board", boardId);
    }

    // Only OWNER can delete
    const member = board.members.find((m) => m.userId === userId);
    if (!member || member.role !== "OWNER") {
      throw new ForbiddenError("Only the board owner can delete this board");
    }

    return boardRepository.delete(boardId);
  },
};

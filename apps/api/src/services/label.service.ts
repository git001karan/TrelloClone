import { labelRepository } from "../repositories/label.repository";
import { boardRepository } from "../repositories/board.repository";
import { NotFoundError, ForbiddenError } from "../middleware/errorHandler";
import type { CreateLabelDto, UpdateLabelDto } from "@trello-clone/shared";

/**
 * Label Service — Business logic for label operations.
 * Labels are board-scoped; access control is enforced via board membership.
 */
export const labelService = {
  async getLabelsByBoard(boardId: string, userId: string) {
    const isMember = await boardRepository.isMember(boardId, userId);
    if (!isMember) {
      throw new ForbiddenError("You don't have access to this board");
    }
    return labelRepository.findAllByBoardId(boardId);
  },

  async createLabel(data: CreateLabelDto, userId: string) {
    const isMember = await boardRepository.isMember(data.boardId, userId);
    if (!isMember) {
      throw new ForbiddenError("You don't have access to this board");
    }

    return labelRepository.create({
      name: data.name,
      color: data.color,
      board: { connect: { id: data.boardId } },
    });
  },

  async updateLabel(labelId: string, data: UpdateLabelDto, userId: string) {
    const label = await labelRepository.findById(labelId);
    if (!label) {
      throw new NotFoundError("Label", labelId);
    }

    const isMember = await boardRepository.isMember(label.boardId, userId);
    if (!isMember) {
      throw new ForbiddenError("You don't have access to this board");
    }

    return labelRepository.update(labelId, data);
  },

  async deleteLabel(labelId: string, userId: string) {
    const label = await labelRepository.findById(labelId);
    if (!label) {
      throw new NotFoundError("Label", labelId);
    }

    const isMember = await boardRepository.isMember(label.boardId, userId);
    if (!isMember) {
      throw new ForbiddenError("You don't have access to this board");
    }

    return labelRepository.delete(labelId);
  },
};

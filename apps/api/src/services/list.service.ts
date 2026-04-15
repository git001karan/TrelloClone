import { listRepository } from "../repositories/list.repository";
import { boardRepository } from "../repositories/board.repository";
import { activityService } from "./activity.service";
import { NotFoundError, ForbiddenError } from "../middleware/errorHandler";
import { needsRebalancing } from "../utils/position";
import { POSITION_GAP } from "@trello-clone/shared";
import type { CreateListDto, UpdateListDto, MoveListDto } from "@trello-clone/shared";

/**
 * List Service — Business logic for list operations.
 * Uses the centralized Activity Service for all logging.
 */
export const listService = {
  async getListsByBoard(boardId: string, userId: string) {
    const isMember = await boardRepository.isMember(boardId, userId);
    if (!isMember) {
      throw new ForbiddenError("You don't have access to this board");
    }

    return listRepository.findAllByBoardId(boardId);
  },

  /**
   * Create a new list at the end of the board.
   * Position is calculated as maxPosition + POSITION_GAP.
   */
  async createList(data: CreateListDto, userId: string) {
    const isMember = await boardRepository.isMember(data.boardId, userId);
    if (!isMember) {
      throw new ForbiddenError("You don't have access to this board");
    }

    // Calculate position (append to end)
    const maxPos = await listRepository.getMaxPosition(data.boardId);
    const position = maxPos !== null ? maxPos + POSITION_GAP : POSITION_GAP;

    const list = await listRepository.create({
      title: data.title,
      position,
      board: { connect: { id: data.boardId } },
    });

    // Log via Activity Service
    await activityService.log({
      action: "LIST_CREATED",
      entityType: "List",
      entityId: list.id,
      userId,
      metadata: { title: list.title, boardId: data.boardId },
    });

    return list;
  },

  async updateList(listId: string, data: UpdateListDto, userId: string) {
    const list = await listRepository.findById(listId);
    if (!list) {
      throw new NotFoundError("List", listId);
    }

    const isMember = await boardRepository.isMember(list.boardId, userId);
    if (!isMember) {
      throw new ForbiddenError("You don't have access to this board");
    }

    return listRepository.update(listId, data);
  },

  /**
   * Move a list to a new position.
   * Triggers rebalancing if positions get too close.
   */
  async moveList(listId: string, data: MoveListDto, userId: string) {
    const list = await listRepository.findById(listId);
    if (!list) {
      throw new NotFoundError("List", listId);
    }

    const isMember = await boardRepository.isMember(data.boardId, userId);
    if (!isMember) {
      throw new ForbiddenError("You don't have access to this board");
    }

    // Update position
    const updatedList = await listRepository.update(listId, {
      position: data.newPosition,
      board: { connect: { id: data.boardId } },
    });

    // Check if rebalancing is needed
    const positions = await listRepository.getPositions(data.boardId);
    if (needsRebalancing(positions)) {
      await listRepository.rebalancePositions(data.boardId, POSITION_GAP);
    }

    // Log via Activity Service
    await activityService.log({
      action: "LIST_MOVED",
      entityType: "List",
      entityId: listId,
      userId,
      metadata: { title: list.title, newPosition: data.newPosition },
    });

    return updatedList;
  },

  async archiveList(listId: string, userId: string) {
    const list = await listRepository.findById(listId);
    if (!list) {
      throw new NotFoundError("List", listId);
    }

    const isMember = await boardRepository.isMember(list.boardId, userId);
    if (!isMember) {
      throw new ForbiddenError("You don't have access to this board");
    }

    await activityService.log({
      action: "LIST_ARCHIVED",
      entityType: "List",
      entityId: listId,
      userId,
      metadata: { title: list.title },
    });

    return listRepository.archive(listId);
  },
};

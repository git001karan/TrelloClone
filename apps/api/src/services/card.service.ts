import { cardRepository } from "../repositories/card.repository";
import { listRepository } from "../repositories/list.repository";
import { boardRepository } from "../repositories/board.repository";
import { activityService } from "./activity.service";
import { NotFoundError, ForbiddenError } from "../middleware/errorHandler";
import { needsRebalancing } from "../utils/position";
import { POSITION_GAP } from "@trello-clone/shared";
import type { CreateCardDto, UpdateCardDto, MoveCardDto } from "@trello-clone/shared";

/**
 * Card Service — Business logic for card operations.
 * Handles position calculations, cross-list moves, and
 * delegates all activity logging to the Activity Service.
 */
export const cardService = {
  async getCard(cardId: string, userId: string) {
    const card = await cardRepository.findById(cardId);
    if (!card) {
      throw new NotFoundError("Card", cardId);
    }

    const isMember = await boardRepository.isMember(card.list.boardId, userId);
    if (!isMember) {
      throw new ForbiddenError("You don't have access to this card's board");
    }

    return card;
  },

  /**
   * Create a new card at the bottom of a list.
   * Position auto-calculated as max + POSITION_GAP.
   */
  async createCard(data: CreateCardDto, userId: string) {
    const list = await listRepository.findById(data.listId);
    if (!list) {
      throw new NotFoundError("List", data.listId);
    }

    const isMember = await boardRepository.isMember(list.boardId, userId);
    if (!isMember) {
      throw new ForbiddenError("You don't have access to this board");
    }

    // Calculate position (append to end)
    const maxPos = await cardRepository.getMaxPosition(data.listId);
    const position = maxPos !== null ? maxPos + POSITION_GAP : POSITION_GAP;

    const card = await cardRepository.create({
      title: data.title,
      description: data.description,
      position,
      list: { connect: { id: data.listId } },
    });

    await activityService.log({
      action: "CARD_CREATED",
      entityType: "Card",
      entityId: card.id,
      userId,
      cardId: card.id,
      metadata: { title: card.title, listTitle: list.title },
    });

    return card;
  },

  async updateCard(cardId: string, data: UpdateCardDto, userId: string) {
    const card = await cardRepository.findById(cardId);
    if (!card) {
      throw new NotFoundError("Card", cardId);
    }

    const isMember = await boardRepository.isMember(card.list.boardId, userId);
    if (!isMember) {
      throw new ForbiddenError("You don't have access to this card's board");
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const updatedCard = await cardRepository.update(cardId, updateData);

    await activityService.log({
      action: "CARD_UPDATED",
      entityType: "Card",
      entityId: cardId,
      userId,
      cardId,
      metadata: {
        title: card.title,
        changes: Object.keys(updateData),
      },
    });

    return updatedCard;
  },

  /**
   * Move a card to a new list and/or position.
   * Handles both intra-list reordering and cross-list moves.
   * Triggers rebalancing if positions get too close.
   *
   * Activity log records: "User moved Card X from 'To Do' to 'In Progress'"
   */
  async moveCard(cardId: string, data: MoveCardDto, userId: string) {
    const card = await cardRepository.findById(cardId);
    if (!card) {
      throw new NotFoundError("Card", cardId);
    }

    const isMember = await boardRepository.isMember(card.list.boardId, userId);
    if (!isMember) {
      throw new ForbiddenError("You don't have access to this card's board");
    }

    // Verify target list exists
    const targetList = await listRepository.findById(data.targetListId);
    if (!targetList) {
      throw new NotFoundError("Target list", data.targetListId);
    }

    const sourceListTitle = card.list.title;
    const targetListTitle = targetList.title;

    // Perform the move (single DB update)
    const movedCard = await cardRepository.move(cardId, data.targetListId, data.newPosition);

    // Check if rebalancing is needed in the target list
    const positions = await cardRepository.getPositions(data.targetListId);
    if (needsRebalancing(positions)) {
      await cardRepository.rebalancePositions(data.targetListId, POSITION_GAP);
    }

    // Log: "User moved Card X from 'To Do' to 'Done'"
    await activityService.log({
      action: "CARD_MOVED",
      entityType: "Card",
      entityId: cardId,
      userId,
      cardId,
      metadata: {
        title: card.title,
        from: sourceListTitle,
        to: targetListTitle,
        newPosition: data.newPosition,
      },
    });

    return movedCard;
  },

  async archiveCard(cardId: string, userId: string) {
    const card = await cardRepository.findById(cardId);
    if (!card) {
      throw new NotFoundError("Card", cardId);
    }

    const isMember = await boardRepository.isMember(card.list.boardId, userId);
    if (!isMember) {
      throw new ForbiddenError("You don't have access to this card's board");
    }

    await activityService.log({
      action: "CARD_ARCHIVED",
      entityType: "Card",
      entityId: cardId,
      userId,
      cardId,
      metadata: { title: card.title },
    });

    return cardRepository.archive(cardId);
  },

  async deleteCard(cardId: string, userId: string) {
    const card = await cardRepository.findById(cardId);
    if (!card) {
      throw new NotFoundError("Card", cardId);
    }

    const isMember = await boardRepository.isMember(card.list.boardId, userId);
    if (!isMember) {
      throw new ForbiddenError("You don't have access to this card's board");
    }

    // Log before deleting (card won't exist after)
    await activityService.log({
      action: "CARD_DELETED",
      entityType: "Card",
      entityId: cardId,
      userId,
      metadata: { title: card.title },
    });

    return cardRepository.delete(cardId);
  },

  // ─── Label Operations ──────────────────────────────

  async addLabel(cardId: string, labelId: string, userId: string) {
    const card = await cardRepository.findById(cardId);
    if (!card) throw new NotFoundError("Card", cardId);

    const isMember = await boardRepository.isMember(card.list.boardId, userId);
    if (!isMember) throw new ForbiddenError();

    await cardRepository.addLabel(cardId, labelId);

    await activityService.log({
      action: "LABEL_ADDED",
      entityType: "Card",
      entityId: cardId,
      userId,
      cardId,
      metadata: { labelId, cardTitle: card.title },
    });

    return cardRepository.findById(cardId);
  },

  async removeLabel(cardId: string, labelId: string, userId: string) {
    const card = await cardRepository.findById(cardId);
    if (!card) throw new NotFoundError("Card", cardId);

    const isMember = await boardRepository.isMember(card.list.boardId, userId);
    if (!isMember) throw new ForbiddenError();

    await cardRepository.removeLabel(cardId, labelId);

    await activityService.log({
      action: "LABEL_REMOVED",
      entityType: "Card",
      entityId: cardId,
      userId,
      cardId,
      metadata: { labelId, cardTitle: card.title },
    });

    return cardRepository.findById(cardId);
  },
};

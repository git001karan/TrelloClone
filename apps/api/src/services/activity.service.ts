import { activityLogRepository } from "../repositories/activityLog.repository";
import { boardRepository } from "../repositories/board.repository";
import { NotFoundError, ForbiddenError } from "../middleware/errorHandler";
import type { ActivityAction } from "@trello-clone/database";
import type { Prisma } from "@trello-clone/database";

// ─────────────────────────────────────────────────────
// HUMAN-READABLE ACTIVITY MESSAGE TEMPLATES
// ─────────────────────────────────────────────────────

const ACTION_TEMPLATES: Record<ActivityAction, (meta: Record<string, any>) => string> = {
  CARD_CREATED:   (m) => `created card "${m.title}" in ${m.listTitle || "a list"}`,
  CARD_MOVED:     (m) => `moved card "${m.title || "a card"}" from "${m.from}" to "${m.to}"`,
  CARD_UPDATED:   (m) => `updated ${m.changes?.join(", ") || "card details"} on a card`,
  CARD_ARCHIVED:  (m) => `archived card "${m.title}"`,
  CARD_DELETED:   (m) => `deleted card "${m.title}"`,
  LIST_CREATED:   (m) => `created list "${m.title}"`,
  LIST_MOVED:     (m) => `moved list "${m.title}" to a new position`,
  LIST_ARCHIVED:  (m) => `archived list "${m.title}"`,
  LABEL_ADDED:    (m) => `added label "${m.labelName || "a label"}" to card "${m.cardTitle || "a card"}"`,
  LABEL_REMOVED:  (m) => `removed label "${m.labelName || "a label"}" from card "${m.cardTitle || "a card"}"`,
  MEMBER_ADDED:   (m) => `added ${m.memberName || "a member"} to the board`,
  MEMBER_REMOVED: (m) => `removed ${m.memberName || "a member"} from the board`,
  COMMENT_ADDED:  (m) => `commented on card "${m.cardTitle || "a card"}"`,
};

/**
 * Generate a human-readable description of an activity.
 */
function formatActivityMessage(action: ActivityAction, metadata: Record<string, any> | null): string {
  const template = ACTION_TEMPLATES[action];
  if (!template) return `performed action: ${action}`;
  return template(metadata || {});
}

// ─────────────────────────────────────────────────────
// ACTIVITY SERVICE
// The "Pro" feature — centralizes all activity logging
// and provides rich, human-readable activity feeds.
// ─────────────────────────────────────────────────────

export interface LogActivityParams {
  action: ActivityAction;
  entityType: "Card" | "List" | "Board" | "Label" | "Member";
  entityId: string;
  userId: string;
  cardId?: string;
  metadata?: Prisma.InputJsonValue;
}

export const activityService = {
  /**
   * Log a new activity. This is the single entry point
   * for all activity tracking across the application.
   */
  async log(params: LogActivityParams) {
    return activityLogRepository.create({
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      userId: params.userId,
      cardId: params.cardId,
      metadata: params.metadata,
    });
  },

  /**
   * Get activity feed for a specific card.
   * Returns activities with human-readable descriptions.
   */
  async getCardActivity(cardId: string, userId: string, limit = 30) {
    const activities = await activityLogRepository.findByCardId(cardId, limit);

    return activities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      description: formatActivityMessage(
        activity.action,
        activity.metadata as Record<string, any> | null
      ),
      user: activity.user,
      createdAt: activity.createdAt,
      metadata: activity.metadata,
    }));
  },

  /**
   * Get activity feed for an entire board.
   * Returns the latest activities across all cards and lists.
   */
  async getBoardActivity(boardId: string, userId: string, limit = 50) {
    // Verify board access
    const isMember = await boardRepository.isMember(boardId, userId);
    if (!isMember) {
      throw new ForbiddenError("You don't have access to this board");
    }

    const activities = await activityLogRepository.findByBoardId(boardId, limit);

    return activities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      description: formatActivityMessage(
        activity.action,
        activity.metadata as Record<string, any> | null
      ),
      user: activity.user,
      card: activity.card,
      entityType: activity.entityType,
      entityId: activity.entityId,
      createdAt: activity.createdAt,
      metadata: activity.metadata,
    }));
  },

  /**
   * Get activity feed for a specific user.
   * Shows what the user has been doing across all boards.
   */
  async getUserActivity(userId: string, limit = 50) {
    const activities = await activityLogRepository.findByUserId(userId, limit);

    return activities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      description: formatActivityMessage(
        activity.action,
        activity.metadata as Record<string, any> | null
      ),
      card: activity.card,
      entityType: activity.entityType,
      entityId: activity.entityId,
      createdAt: activity.createdAt,
      metadata: activity.metadata,
    }));
  },
};

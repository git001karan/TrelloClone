import { Router } from "express";
import { activityController } from "../controllers/activity.controller";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

// ─── All activity routes require authentication ──────
router.use(authenticate);

// Board activity feed — "User A moved Card X from 'To Do' to 'Done'"
router.get("/board/:boardId", asyncHandler(activityController.getBoardActivity));

// Card activity feed — all actions on a specific card
router.get("/card/:cardId", asyncHandler(activityController.getCardActivity));

// User activity feed — all actions by the current user
router.get("/me", asyncHandler(activityController.getUserActivity));

export { router as activityRoutes };

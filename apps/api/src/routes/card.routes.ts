import { Router } from "express";
import { cardController } from "../controllers/card.controller";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

// ─── Validation Schemas ──────────────────────────────
const createCardSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  listId: z.string().min(1, "List ID is required"),
  description: z.string().max(5000).optional(),
});

const updateCardSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

const moveCardSchema = z.object({
  targetListId: z.string().min(1, "Target list ID is required"),
  newPosition: z.number().positive("Position must be positive"),
});

// ─── Routes (all authenticated) ──────────────────────
router.use(authenticate);

router.get("/:id",                asyncHandler(cardController.getCard));
router.post("/",                  validate(createCardSchema), asyncHandler(cardController.createCard));
router.patch("/:id",              validate(updateCardSchema), asyncHandler(cardController.updateCard));
router.patch("/:id/move",         validate(moveCardSchema),   asyncHandler(cardController.moveCard));
router.patch("/:id/archive",      asyncHandler(cardController.archiveCard));
router.delete("/:id",             asyncHandler(cardController.deleteCard));

// Label operations on cards
router.post("/:id/labels/:labelId",   asyncHandler(cardController.addLabel));
router.delete("/:id/labels/:labelId", asyncHandler(cardController.removeLabel));

export { router as cardRoutes };

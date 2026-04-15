import { Router } from "express";
import { listController } from "../controllers/list.controller";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

// ─── Validation Schemas ──────────────────────────────
const createListSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  boardId: z.string().min(1, "Board ID is required"),
});

const updateListSchema = z.object({
  title: z.string().min(1).max(100).optional(),
});

const moveListSchema = z.object({
  boardId: z.string().min(1),
  newPosition: z.number().min(0, "Position must be non-negative"),
});

// ─── Routes (all authenticated) ──────────────────────
router.use(authenticate);

router.get("/board/:boardId", asyncHandler(listController.getListsByBoard));
router.post("/",              validate(createListSchema), asyncHandler(listController.createList));
router.patch("/:id",          validate(updateListSchema), asyncHandler(listController.updateList));
router.patch("/:id/move",     validate(moveListSchema),   asyncHandler(listController.moveList));
router.patch("/:id/archive",  asyncHandler(listController.archiveList));

export { router as listRoutes };

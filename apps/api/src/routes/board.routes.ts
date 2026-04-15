import { Router } from "express";
import { boardController } from "../controllers/board.controller";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

// ─── Validation Schemas ──────────────────────────────
const createBoardSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional(),
});

const updateBoardSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  isClosed: z.boolean().optional(),
});

// ─── Routes (all authenticated) ──────────────────────
router.use(authenticate);

router.get("/",      asyncHandler(boardController.getUserBoards));
router.get("/:id",   asyncHandler(boardController.getBoard));
router.post("/",     validate(createBoardSchema), asyncHandler(boardController.createBoard));
router.patch("/:id", validate(updateBoardSchema), asyncHandler(boardController.updateBoard));
router.delete("/:id", asyncHandler(boardController.deleteBoard));

export { router as boardRoutes };

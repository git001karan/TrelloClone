import { Router } from "express";
import { labelController } from "../controllers/label.controller";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

// ─── Validation Schemas ──────────────────────────────
const createLabelSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color"),
  boardId: z.string().min(1, "Board ID is required"),
});

const updateLabelSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

// ─── Routes (all authenticated) ──────────────────────
router.use(authenticate);

router.get("/board/:boardId", asyncHandler(labelController.getLabelsByBoard));
router.post("/",              validate(createLabelSchema), asyncHandler(labelController.createLabel));
router.patch("/:id",          validate(updateLabelSchema), asyncHandler(labelController.updateLabel));
router.delete("/:id",         asyncHandler(labelController.deleteLabel));

export { router as labelRoutes };

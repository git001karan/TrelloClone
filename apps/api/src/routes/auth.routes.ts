import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

// ─── Validation Schemas ──────────────────────────────
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Routes ──────────────────────────────────────────
router.post("/register", validate(registerSchema), asyncHandler(authController.register));
router.post("/login",    validate(loginSchema),    asyncHandler(authController.login));
router.get("/me",        authenticate,             asyncHandler(authController.me));

export { router as authRoutes };

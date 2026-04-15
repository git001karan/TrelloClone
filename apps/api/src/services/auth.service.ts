import { userRepository } from "../repositories/user.repository";
import { UnauthorizedError, ConflictError } from "../middleware/errorHandler";
import { AppError } from "../middleware/errorHandler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { RegisterDto, LoginDto, AuthResponse } from "@trello-clone/shared";

const SALT_ROUNDS = 12;

/**
 * Auth Service — Business logic for authentication.
 * Handles registration, login, and JWT token generation.
 */
export const authService = {
  async register(data: RegisterDto): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError("An account with this email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await userRepository.create({
      email: data.email,
      name: data.name,
      passwordHash,
    });

    // Generate JWT
    const token = generateToken(user.id, user.email);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl ?? null,
      },
    };
  },

  async login(data: LoginDto): Promise<AuthResponse> {
    // Find user by email (need the full record for password check)
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Generate JWT
    const token = generateToken(user.id, user.email);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  },
};

function generateToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT secret not configured", 500, "CONFIG_ERROR", false);
  }

  return jwt.sign(
    { userId, email },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"] }
  );
}

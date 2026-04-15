import { prisma } from "../lib/prisma";

/**
 * User Repository — Data access layer for users.
 */
export const userRepository = {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async create(data: { email: string; name: string; passwordHash: string }) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  },

  async update(id: string, data: { name?: string; avatarUrl?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
      },
    });
  },
};

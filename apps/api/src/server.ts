import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { boardRoutes } from "./routes/board.routes";
import { listRoutes } from "./routes/list.routes";
import { cardRoutes } from "./routes/card.routes";
import { labelRoutes } from "./routes/label.routes";
import { authRoutes } from "./routes/auth.routes";
import { activityRoutes } from "./routes/activity.routes";

dotenv.config({ path: "../../.env" });

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// ─── Socket.io ───────────────────────────────────────
export const io = new SocketIOServer(httpServer, {
  cors: { origin: CORS_ORIGIN, methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  socket.on("join-board", (boardId: string) => {
    socket.join(`board:${boardId}`);
  });
  socket.on("leave-board", (boardId: string) => {
    socket.leave(`board:${boardId}`);
  });
});

// ─── Global Middleware ───────────────────────────────
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(requestLogger);
}

// ─── Health Check ────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "1.0.0",
    },
  });
});

// ─── API Routes ──────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/boards",   boardRoutes);
app.use("/api/lists",    listRoutes);
app.use("/api/cards",    cardRoutes);
app.use("/api/labels",   labelRoutes);
app.use("/api/activity", activityRoutes);

// ─── 404 Handler ─────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found", code: "ROUTE_NOT_FOUND" });
});

app.use(errorHandler);

// ─── Start Server ────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`
┌─────────────────────────────────────────────┐
│         🚀 Trello Clone API v1.0.0          │
├─────────────────────────────────────────────┤
│  Server:    http://localhost:${PORT}            │
│  Health:    http://localhost:${PORT}/api/health  │
│  Sockets:   enabled (Socket.io)              │
└─────────────────────────────────────────────┘
  `);
});

export default app;

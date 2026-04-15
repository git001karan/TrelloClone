"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { boardKeys } from "@/lib/board-query-keys";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:4000";

export function useBoardSocket(boardId: string | null) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!boardId) return;

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("join-board", boardId);

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    };

    socket.on("card-moved", invalidate);
    socket.on("card-updated", invalidate);
    socket.on("list-added", invalidate);
    socket.on("list-moved", invalidate);

    return () => {
      socket.emit("leave-board", boardId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [boardId, queryClient]);
}

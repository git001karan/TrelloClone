"use client";

import { useParams } from "next/navigation";
import { AuthGate } from "@/components/auth/auth-gate";
import { BoardView } from "@/components/board";

export default function BoardPage() {
  const params = useParams();
  const boardId = typeof params.boardId === "string" ? params.boardId : "";

  return (
    <AuthGate>
      <BoardView boardId={boardId || null} />
    </AuthGate>
  );
}

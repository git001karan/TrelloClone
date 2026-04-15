"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { boardKeys } from "@/lib/board-query-keys";
import { cn } from "@/lib/utils";
import type { CreateBoardDto } from "@trello-clone/shared";

interface BoardSummary {
  id: string;
  title: string;
  background?: string | null;
}

export function WorkspaceHome() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const boardsQuery = useQuery({
    queryKey: boardKeys.boards(),
    queryFn: () => apiGet<BoardSummary[]>("/boards"),
    retry: false,
  });

  const createBoardMutation = useMutation({
    mutationFn: (payload: CreateBoardDto) =>
      apiPost<BoardSummary, CreateBoardDto>("/boards", payload),
    onSuccess: (board) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.boards() });
      toast.success("Board created");
      router.push(`/board/${board.id}`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Could not create board");
    },
  });

  const handleCreate = () => {
    const title = window.prompt("Board name", "New board");
    if (!title?.trim()) return;
    createBoardMutation.mutate({ title: title.trim() });
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <header className="border-b border-[#091e4226] bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0079bf] text-white shadow-sm">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5e6c84]">
                Workspace
              </p>
              <h1 className="text-lg font-bold text-[#172b4d]">Your boards</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={createBoardMutation.isPending}
            className={cn(
              "inline-flex items-center gap-2 rounded-md bg-[#0079bf] px-4 py-2 text-sm font-semibold text-white shadow-sm",
              "hover:bg-[#026aa7] disabled:opacity-60"
            )}
          >
            <Plus className="h-4 w-4" />
            Create board
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {boardsQuery.isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-lg bg-[#dfe1e6]"
              />
            ))}
          </div>
        )}

        {boardsQuery.isError && (
          <p className="text-sm text-red-600">
            Could not load boards. Check that the API is running and you are signed in.
          </p>
        )}

        {boardsQuery.data && boardsQuery.data.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#091e424f] bg-white p-10 text-center">
            <p className="text-[#172b4d] font-semibold">No boards yet</p>
            <p className="mt-1 text-sm text-[#5e6c84]">
              Create your first board to get started.
            </p>
            <button
              type="button"
              onClick={handleCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#0079bf] px-4 py-2 text-sm font-semibold text-white hover:bg-[#026aa7]"
            >
              <Plus className="h-4 w-4" />
              Create board
            </button>
          </div>
        )}

        {boardsQuery.data && boardsQuery.data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boardsQuery.data.map((b) => (
              <Link
                key={b.id}
                href={`/board/${b.id}`}
                className="group relative overflow-hidden rounded-lg shadow-[0_1px_0_rgba(9,30,66,0.25)] transition hover:scale-[1.01]"
              >
                <div
                  className="h-24 min-h-[96px] flex-none px-4 py-3 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${b.background || "#0079bf"} 0%, #026aa7 100%)`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 text-base font-bold leading-snug">
                      {b.title}
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, LayoutGrid, ChevronRight, LogOut, Star } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { boardKeys } from "@/lib/board-query-keys";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import type { CreateBoardDto } from "@trello-clone/shared";
import { useStarredBoards } from "@/hooks/use-starred-boards";

interface BoardSummary {
  id: string;
  title: string;
  background?: string | null;
}

const BOARD_GRADIENTS = [
  "linear-gradient(135deg, #0079bf 0%, #026aa7 100%)",
  "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
  "linear-gradient(135deg, #059669 0%, #047857 100%)",
  "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
  "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
  "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
  "linear-gradient(135deg, #be185d 0%, #9d174d 100%)",
  "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
];

function getBoardGradient(bg?: string | null, index?: number) {
  if (bg?.startsWith("url(")) return bg;
  if (bg?.startsWith("#")) return `linear-gradient(135deg, ${bg} 0%, ${bg}cc 100%)`;
  return BOARD_GRADIENTS[(index ?? 0) % BOARD_GRADIENTS.length];
}

export function WorkspaceHome() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout, user } = useAuth();
  const { starredIds, toggleStar } = useStarredBoards();
  const [activeNav, setActiveNav] = useState<"boards" | "starred">("boards");

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
    <div className="min-h-screen" style={{ background: "#f0f2f5" }}>
      {/* Top navbar */}
      <header className="sticky top-0 z-20 border-b border-[#091e4214] bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0079bf] text-white shadow-sm">
              <LayoutGrid className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-[#172b4d]">Trello Clone</span>
            {user && (
              <span className="hidden text-sm text-[#5e6c84] sm:block">— {user.name}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={createBoardMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#0079bf] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#026aa7] disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Create board
            </button>
            <button
              type="button"
              onClick={() => { logout(); router.push("/"); }}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#dfe1e6] px-3 py-2 text-sm font-medium text-[#44546f] transition hover:bg-[#f4f5f7] hover:text-[#172b4d]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
        {/* Left sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="rounded-xl border border-[#091e4214] bg-white p-4 shadow-sm">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#5e6c84]">
              Workspace
            </p>
            <nav className="space-y-0.5">
              {[
                { label: "Boards", key: "boards" as const },
                { label: "Starred", key: "starred" as const },
              ].map(({ label, key }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveNav(key)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    activeNav === key
                      ? "bg-[#e9f2ff] text-[#0079bf]"
                      : "text-[#44546f] hover:bg-[#f4f5f7] hover:text-[#172b4d]"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {key === "starred" && <Star className="h-3.5 w-3.5" />}
                    {label}
                  </span>
                  {activeNav === key && <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#172b4d]">
              {activeNav === "starred" ? "Starred boards" : "Your boards"}
            </h2>
            <span className="text-xs text-[#5e6c84]">
              {boardsQuery.data?.length ?? 0} board{boardsQuery.data?.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Loading skeletons */}
          {boardsQuery.isLoading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-[#dfe1e6]" />
              ))}
            </div>
          )}

          {/* Error */}
          {boardsQuery.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">
                Could not load boards. Check that the API is running and you are signed in.
              </p>
            </div>
          )}

          {/* Empty state */}
          {boardsQuery.data?.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-[#c1c7d0] bg-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f2ff]">
                <LayoutGrid className="h-6 w-6 text-[#0079bf]" />
              </div>
              <p className="font-semibold text-[#172b4d]">No boards yet</p>
              <p className="mt-1 text-sm text-[#5e6c84]">Create your first board to get started.</p>
              <button
                type="button"
                onClick={handleCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0079bf] px-4 py-2 text-sm font-semibold text-white hover:bg-[#026aa7]"
              >
                <Plus className="h-4 w-4" />
                Create board
              </button>
            </div>
          )}

          {/* Board grid */}
          {boardsQuery.data && boardsQuery.data.length > 0 && (() => {
            const displayBoards = activeNav === "starred"
              ? boardsQuery.data.filter(b => starredIds.includes(b.id))
              : boardsQuery.data;
            return (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayBoards.length === 0 && activeNav === "starred" && (
                  <div className="col-span-full rounded-xl border-2 border-dashed border-[#c1c7d0] bg-white p-10 text-center">
                    <Star className="mx-auto mb-3 h-8 w-8 text-[#c1c7d0]" />
                    <p className="font-semibold text-[#172b4d]">No starred boards</p>
                    <p className="mt-1 text-sm text-[#5e6c84]">Star a board to find it here quickly.</p>
                  </div>
                )}
                {displayBoards.map((b, i) => (
                  <div key={b.id} className="group relative overflow-hidden rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <Link href={`/board/${b.id}`} className="block">
                      <div className="h-28 p-4" style={{ background: getBoardGradient(b.background, i) }}>
                        <span className="line-clamp-2 text-sm font-bold leading-snug text-white drop-shadow-sm">{b.title}</span>
                      </div>
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 rounded-xl" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/20 px-4 py-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80">Open board</span>
                      </div>
                    </Link>
                    {/* Star toggle */}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); toggleStar(b.id); }}
                      className="absolute right-2 top-2 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/20"
                      title={starredIds.includes(b.id) ? "Unstar" : "Star"}
                    >
                      <Star className={cn("h-4 w-4", starredIds.includes(b.id) ? "fill-amber-300 text-amber-300" : "text-white")} />
                    </button>
                  </div>
                ))}
                {activeNav === "boards" && (
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="group flex h-28 items-center justify-center rounded-xl border-2 border-dashed border-[#c1c7d0] bg-white text-[#5e6c84] transition-all hover:border-[#0079bf] hover:bg-[#e9f2ff] hover:text-[#0079bf]"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <Plus className="h-5 w-5" />
                      <span className="text-xs font-semibold">New board</span>
                    </div>
                  </button>
                )}
              </div>
            );
          })()}
        </main>
      </div>
    </div>
  );
}

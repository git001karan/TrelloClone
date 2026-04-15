"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, Clock, ChevronLeft, ChevronRight, Home, Star, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet } from "@/lib/api";
import { boardKeys } from "@/lib/board-query-keys";
import { useAuth } from "@/hooks/use-auth";
import { useStarredBoards } from "@/hooks/use-starred-boards";

interface BoardSummary {
  id: string;
  title: string;
  background?: string | null;
}

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showStarred, setShowStarred] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { starredIds } = useStarredBoards();

  const boardsQuery = useQuery({
    queryKey: boardKeys.boards(),
    queryFn: () => apiGet<BoardSummary[]>("/boards"),
    retry: false,
  });

  const recentBoards = boardsQuery.data?.slice(0, 5) ?? [];
  const starredBoards = boardsQuery.data?.filter(b => starredIds.includes(b.id)) ?? [];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "relative z-30 flex h-full shrink-0 flex-col",
          "border-r border-black/20",
          "transition-all duration-200 ease-in-out",
          collapsed ? "w-0 overflow-hidden" : "w-[240px]"
        )}
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Workspace header */}
          <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/15">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#0079bf] to-[#5aac44] text-white shadow">
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-white/60">
                Workspace
              </p>
              <p className="truncate text-sm font-bold text-white">My Boards</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5 px-2 py-3">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white",
                pathname === "/" && "bg-white/20 text-white"
              )}
            >
              <Home className="h-4 w-4 shrink-0" />
              Home
            </Link>
            <button
              type="button"
              onClick={() => setShowStarred((v) => !v)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white",
                showStarred && "bg-white/20 text-white"
              )}
            >
              <Star className="h-4 w-4 shrink-0" />
              Starred
              {starredBoards.length > 0 && (
                <span className="ml-auto rounded-full bg-amber-400/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {starredBoards.length}
                </span>
              )}
            </button>
          </nav>

          {/* Recent / Starred boards */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {showStarred ? (
              <>
                <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-amber-300/80">
                  Starred Boards
                </p>
                {starredBoards.length === 0 && (
                  <p className="px-3 text-xs text-white/50">No starred boards yet</p>
                )}
                {starredBoards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/board/${board.id}`}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white",
                      pathname === `/board/${board.id}` && "bg-white/20 text-white"
                    )}
                  >
                    <span className="h-4 w-4 shrink-0 rounded" style={{ background: board.background || "#0079bf" }} />
                    <span className="truncate">{board.title}</span>
                    <Star className="ml-auto h-3 w-3 shrink-0 fill-amber-300 text-amber-300" />
                  </Link>
                ))}
              </>
            ) : (
              <>
                <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/60">
                  Recent Boards
                </p>
                {boardsQuery.isLoading && (
                  <div className="space-y-1 px-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 animate-pulse rounded-lg bg-white/10" />
                    ))}
                  </div>
                )}
                {recentBoards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/board/${board.id}`}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white",
                      pathname === `/board/${board.id}` && "bg-white/20 text-white"
                    )}
                  >
                    <span className="h-4 w-4 shrink-0 rounded" style={{ background: board.background || "#0079bf" }} />
                    <span className="truncate">{board.title}</span>
                  </Link>
                ))}
                {boardsQuery.data?.length === 0 && (
                  <p className="px-3 text-xs text-white/50">No boards yet</p>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/15 px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-white/50" />
              <span className="text-[11px] text-white/60">
                {recentBoards.length} board{recentBoards.length !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              type="button"
              onClick={() => { logout(); router.push("/"); }}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-red-300"
              title="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        style={{ left: collapsed ? 4 : 228 }}
        className="absolute top-[72px] z-40 flex h-6 w-6 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white shadow-md backdrop-blur-sm transition-all hover:bg-black/60"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}

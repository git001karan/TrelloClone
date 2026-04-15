"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { DummyBoard } from "@/lib/dummy-data";
import {
  Star,
  Users,
  LayoutGrid,
  Filter,
  MoreHorizontal,
  Zap,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

interface BoardHeaderProps {
  board: DummyBoard;
  isLoading?: boolean;
  searchValue: string;
  selectedLabelId: string;
  selectedMemberId: string;
  onSearchChange: (value: string) => void;
  onLabelChange: (value: string) => void;
  onMemberChange: (value: string) => void;
  onOpenActivity: () => void;
  onLogout: () => void;
}

export function BoardHeader({
  board,
  isLoading,
  searchValue,
  selectedLabelId,
  selectedMemberId,
  onSearchChange,
  onLabelChange,
  onMemberChange,
  onOpenActivity,
  onLogout,
}: BoardHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-2.5 md:px-6",
        "bg-black/25 backdrop-blur-md",
        "border-b border-white/10 shadow-sm"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-white/85 transition-colors hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Boards</span>
        </Link>

        <div className="h-5 w-px shrink-0 bg-white/20" />

        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="hidden h-4 w-4 shrink-0 text-amber-300/90 sm:block" />
          <h1
            className={cn(
              "truncate text-base font-bold tracking-tight text-white md:text-lg",
              isLoading && "animate-pulse bg-white/20 text-transparent rounded"
            )}
          >
            {board.title}
          </h1>
        </div>

        <button
          type="button"
          className="shrink-0 rounded-md p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-amber-300"
          aria-label="Star board"
        >
          <Star className="h-4 w-4" />
        </button>

        <div className="hidden h-5 w-px bg-white/15 sm:block" />

        <span className="hidden items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80 sm:inline-flex">
          <LayoutGrid className="h-3.5 w-3.5" />
          Board
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
        <button
          type="button"
          onClick={onOpenActivity}
          className="hidden items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white sm:flex"
        >
          <Zap className="h-3.5 w-3.5" />
          Activity
        </button>

        <div className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1.5 ring-1 ring-white/10">
          <Filter className="h-3.5 w-3.5 shrink-0 text-white/50" />
          <input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter cards…"
            className="w-24 bg-transparent text-xs text-white placeholder:text-white/40 focus:outline-none md:w-40"
          />
        </div>

        <select
          value={selectedLabelId}
          onChange={(e) => onLabelChange(e.target.value)}
          className="max-w-[100px] rounded-md border border-white/10 bg-white/10 px-1.5 py-1.5 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-white/30 md:max-w-none md:text-xs"
        >
          <option value="">Labels</option>
          {board.labels.map((label) => (
            <option key={label.id} value={label.id} className="text-[#172b4d]">
              {label.name}
            </option>
          ))}
        </select>
        <select
          value={selectedMemberId}
          onChange={(e) => onMemberChange(e.target.value)}
          className="max-w-[100px] rounded-md border border-white/10 bg-white/10 px-1.5 py-1.5 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-white/30 md:max-w-none md:text-xs"
        >
          <option value="">Members</option>
          {board.members.map((member) => (
            <option
              key={member.user.id}
              value={member.user.id}
              className="text-[#172b4d]"
            >
              {member.user.name}
            </option>
          ))}
        </select>

        <div className="hidden h-5 w-px bg-white/15 md:block" />

        <div className="hidden items-center gap-1 md:flex">
          <Users className="h-3.5 w-3.5 text-white/40" />
          <div className="flex -space-x-2">
            {board.members.slice(0, 4).map((member) => (
              <div
                key={member.user.id}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full",
                  "border-2 border-black/20",
                  "bg-gradient-to-br from-[#5aac44] to-[#0079bf]",
                  "text-[10px] font-bold text-white",
                  "transition-transform hover:z-10 hover:scale-110"
                )}
                title={`${member.user.name} (${member.role})`}
              >
                {member.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="hidden rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-white/25 md:inline"
        >
          Share
        </button>

        <button
          type="button"
          className="rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white/80"
          aria-label="More"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-md border border-white/20 px-2 py-1 text-[11px] font-medium text-white/85 hover:bg-white/10"
        >
          Log out
        </button>
      </div>
    </header>
  );
}

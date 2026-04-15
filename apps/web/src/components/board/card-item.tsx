"use client";

import { useState, memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { DummyCard } from "@/lib/dummy-data";
import {
  MessageSquare,
  Calendar,
  Paperclip,
  MoreHorizontal,
} from "lucide-react";

interface CardItemProps {
  card: DummyCard;
  onEdit?: (cardId: string) => void;
  isDragOverlay?: boolean;
}

export const CardItem = memo(function CardItem({
  card,
  onEdit,
  isDragOverlay = false,
}: CardItemProps) {
  const [isHovering, setIsHovering] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "card",
      card,
      listId: card.listId,
    },
    disabled: isDragOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.35 : 1,
  };

  const hasLabels = card.labels.length > 0;
  const hasAssignees = card.assignees.length > 0;
  const hasDueDate = card.dueDate !== null;
  const hasDescription = card.description !== null;

  const formattedDueDate = hasDueDate
    ? new Date(card.dueDate!).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  const isDueToday = hasDueDate && isToday(new Date(card.dueDate!));
  const isOverdue =
    hasDueDate && new Date(card.dueDate!) < new Date() && !isDueToday;
  const isDueSoon =
    hasDueDate &&
    !isOverdue &&
    !isDueToday &&
    isDueWithin(new Date(card.dueDate!), 3);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative rounded-lg bg-white p-2.5 shadow-[0_1px_0_rgba(9,30,66,0.25)]",
        "cursor-grab select-none active:cursor-grabbing",
        "card-hover-glow",
        "border border-transparent hover:border-[#091e4226]",
        isDragging && "opacity-0 pointer-events-none",
        isDragOverlay && "card-dragging-overlay ring-2 ring-[#0079bf]/60"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => {
        if (!isDragging) onEdit?.(card.id);
      }}
    >
      {isHovering && !isDragging && (
        <button
          type="button"
          className="absolute right-1.5 top-1.5 z-10 rounded bg-[#f4f5f7] p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-[#ebecf0]"
          onClick={(e) => {
            e.stopPropagation();
          }}
          aria-label="Card menu"
        >
          <MoreHorizontal className="h-3.5 w-3.5 text-[#5e6c84]" />
        </button>
      )}

      {hasLabels && (
        <div className="mb-2 flex flex-wrap gap-1">
          {card.labels.map((label) => (
            <span
              key={label.id}
              className="inline-block h-2 min-w-[40px] max-w-full rounded-full px-0 text-[0] leading-none"
              style={{ backgroundColor: label.color }}
              title={label.name}
            />
          ))}
        </div>
      )}

      <p className="text-sm font-medium leading-snug text-[#172b4d] pr-6">
        {card.title}
      </p>

      {(hasDueDate ||
        hasDescription ||
        card._count.activityLogs > 0 ||
        hasAssignees) && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {hasDueDate && (
              <span
                className={cn(
                  "flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium",
                  isOverdue && "bg-red-100 text-red-700",
                  isDueToday && "bg-amber-100 text-amber-800",
                  isDueSoon && "bg-amber-50 text-amber-700",
                  !isOverdue &&
                    !isDueToday &&
                    !isDueSoon &&
                    "text-[#5e6c84]"
                )}
              >
                <Calendar className="h-3 w-3" />
                {formattedDueDate}
              </span>
            )}

            {hasDescription && (
              <span className="text-[#5e6c84]" title="Has description">
                <Paperclip className="h-3 w-3" />
              </span>
            )}

            {card._count.activityLogs > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-[#5e6c84]">
                <MessageSquare className="h-3 w-3" />
                {card._count.activityLogs}
              </span>
            )}
          </div>

          {hasAssignees && (
            <div className="flex shrink-0 -space-x-1.5">
              {card.assignees.slice(0, 3).map((user) => (
                <div
                  key={user.id}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#dfe1e6] text-[10px] font-bold text-[#172b4d]"
                  title={user.name}
                >
                  {getInitials(user.name)}
                </div>
              ))}
              {card.assignees.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#dfe1e6] text-[10px] font-medium text-[#5e6c84]">
                  +{card.assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isDueWithin(date: Date, days: number): boolean {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return diff > 0 && diff < days * 24 * 60 * 60 * 1000;
}

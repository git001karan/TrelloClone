"use client";

import { useState, useRef, useMemo, memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CardItem } from "./card-item";
import { AddCard } from "./add-card";
import { cn } from "@/lib/utils";
import type { DummyList } from "@/lib/dummy-data";
import { MoreHorizontal, GripVertical } from "lucide-react";

interface ListColumnProps {
  list: DummyList;
  onAddCard: (listId: string, title: string) => void;
  onEditCard?: (cardId: string) => void;
  onUpdateTitle?: (listId: string, title: string) => void;
  isDragOverlay?: boolean;
}

export const ListColumn = memo(function ListColumn({
  list,
  onAddCard,
  onEditCard,
  onUpdateTitle,
  isDragOverlay = false,
}: ListColumnProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: "list",
      list,
    },
    disabled: isDragOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.55 : 1,
  };

  const sortedCards = useMemo(
    () => [...list.cards].sort((a, b) => a.position - b.position),
    [list.cards]
  );

  const cardIds = useMemo(
    () => sortedCards.map((c) => c.id),
    [sortedCards]
  );

  const handleTitleSubmit = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== list.title) {
      onUpdateTitle?.(list.id, trimmed);
    } else {
      setEditTitle(list.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleSubmit();
    }
    if (e.key === "Escape") {
      setEditTitle(list.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex h-fit max-h-[calc(100vh-120px)] w-[272px] shrink-0 flex-col",
        "rounded-xl bg-[#ebecf0] text-[#172b4d]",
        "shadow-[0_1px_0_rgba(9,30,66,0.25)]",
        isDragging && "ring-2 ring-white/60 ring-offset-2 ring-offset-transparent",
        isDragOverlay &&
          "rotate-[1.5deg] shadow-2xl shadow-black/50 ring-2 ring-white/60 scale-[1.01]"
      )}
    >
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-4 w-4 shrink-0 text-[#5e6c84] hover:text-[#172b4d]" />
          </div>

          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className={cn(
                "flex-1 rounded border border-[#0079bf] bg-white px-2 py-0.5",
                "text-sm font-semibold text-[#172b4d] outline-none",
                "focus:ring-1 focus:ring-[#0079bf]/40"
              )}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsEditingTitle(true);
                setEditTitle(list.title);
              }}
              className="flex-1 truncate text-left text-sm font-semibold text-[#172b4d] hover:underline rounded px-1 py-0.5"
            >
              {list.title}
            </button>
          )}

          <span className="shrink-0 rounded-full bg-black/[0.08] px-2 py-0.5 text-[11px] font-semibold text-[#5e6c84]">
            {list.cards.length}
          </span>
        </div>

        <button
          type="button"
          className="shrink-0 rounded-md p-1 text-[#5e6c84] hover:bg-black/[0.08] hover:text-[#172b4d]"
          aria-label="List actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div className="list-cards-scroll flex flex-col gap-2 px-2 py-1 min-h-[8px]">
          {sortedCards.map((card) => (
            <CardItem key={card.id} card={card} onEdit={onEditCard} />
          ))}
        </div>
      </SortableContext>

      <div className="px-2 pb-2">
        <AddCard listId={list.id} onAdd={onAddCard} />
      </div>
    </div>
  );
});

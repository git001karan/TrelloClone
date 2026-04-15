"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddListProps {
  onAdd: (title: string) => void;
}

/**
 * AddList — Creates a new list at the end of the board.
 * Toggles between a ghost button and an input form.
 */
export function AddList({ onAdd }: AddListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (trimmed) {
      onAdd(trimmed);
      setTitle("");
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setIsAdding(false);
      setTitle("");
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className={cn(
          "flex h-fit min-w-[272px] shrink-0 items-center gap-2 rounded-xl",
          "border border-dashed border-white/35 bg-white/14 px-4 py-3",
          "text-sm font-medium text-white/90",
          "transition-all duration-200",
          "hover:bg-white/22 hover:border-white/50"
        )}
      >
        <Plus className="h-4 w-4" />
        Add another list
      </button>
    );
  }

  return (
    <div className="min-w-[280px] shrink-0 animate-scale-in">
      <div className="rounded-xl bg-[#ebecf0] p-3 shadow-[0_1px_0_rgba(9,30,66,0.25)]">
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter list title..."
          className={cn(
            "w-full rounded-lg border border-border bg-card px-3 py-2",
            "text-sm text-foreground placeholder:text-muted-foreground/50",
            "outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
            "transition-all duration-150"
          )}
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className={cn(
              "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground",
              "hover:bg-primary/90 transition-all",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            Add list
          </button>
          <button
            onClick={() => { setIsAdding(false); setTitle(""); }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

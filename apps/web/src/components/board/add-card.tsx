"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddCardProps {
  listId: string;
  onAdd: (listId: string, title: string) => void;
}

/**
 * AddCard — Inline card creation form at the bottom of a list.
 * Toggles between a button and an input field.
 * Supports Enter to submit, Escape to cancel.
 */
export function AddCard({ listId, onAdd }: AddCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (trimmed) {
      onAdd(listId, trimmed);
      setTitle("");
      // Keep the form open for rapid card entry
      inputRef.current?.focus();
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-lg px-2 py-2",
          "text-sm font-medium text-[#5e6c84]",
          "transition-all duration-150",
          "hover:bg-black/[0.08] hover:text-[#172b4d]"
        )}
      >
        <Plus className="h-4 w-4" />
        Add a card
      </button>
    );
  }

  return (
    <div className="animate-fade-in">
      <textarea
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a title for this card..."
        className={cn(
          "w-full rounded-lg border border-border/60 bg-card p-3",
          "text-sm text-foreground placeholder:text-muted-foreground/50",
          "resize-none outline-none",
          "focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
          "transition-all duration-150"
        )}
        rows={2}
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className={cn(
            "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground",
            "transition-all duration-150",
            "hover:bg-primary/90",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          Add card
        </button>
        <button
          onClick={handleCancel}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary/50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

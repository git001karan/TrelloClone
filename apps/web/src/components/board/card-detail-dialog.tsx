"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Calendar, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DummyCard } from "@/lib/dummy-data";

interface CardDetailDialogProps {
  card: DummyCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardDetailDialog({
  card,
  open,
  onOpenChange,
}: CardDetailDialogProps) {
  if (!card) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px]" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[101] w-[min(100vw-2rem,560px)] max-h-[85vh] -translate-x-1/2 -translate-y-1/2",
            "rounded-xl border border-border bg-card shadow-2xl outline-none"
          )}
        >
          <div className="flex max-h-[85vh] flex-col overflow-hidden">
            <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <Dialog.Title className="pr-8 text-lg font-semibold leading-snug text-foreground">
                {card.title}
              </Dialog.Title>
              <Dialog.Close
                className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {card.labels.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {card.labels.map((label) => (
                    <span
                      key={label.id}
                      className="rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </h3>
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {card.description || (
                    <span className="text-muted-foreground italic">
                      Add a more detailed description…
                    </span>
                  )}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {card.dueDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {new Date(card.dueDate).toLocaleString()}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  {card._count.activityLogs} comments
                </span>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

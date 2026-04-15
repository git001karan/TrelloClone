"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Calendar,
  Tag,
  Users,
  CheckSquare,
  AlignLeft,
  Activity,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DummyCard, DummyLabel } from "@/lib/dummy-data";

// ── Minimal markdown renderer (bold, italic, code, links) ──
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Heading
    if (line.startsWith("### ")) return <h3 key={i} className="mt-3 mb-1 text-sm font-bold text-[#172b4d]">{line.slice(4)}</h3>;
    if (line.startsWith("## ")) return <h2 key={i} className="mt-3 mb-1 text-base font-bold text-[#172b4d]">{line.slice(3)}</h2>;
    if (line.startsWith("# ")) return <h1 key={i} className="mt-3 mb-1 text-lg font-bold text-[#172b4d]">{line.slice(2)}</h1>;
    // List item
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return <li key={i} className="ml-4 list-disc text-sm text-[#172b4d]">{inlineMarkdown(line.slice(2))}</li>;
    }
    if (line === "") return <br key={i} />;
    return <p key={i} className="text-sm leading-relaxed text-[#172b4d]">{inlineMarkdown(line)}</p>;
  });
}

function inlineMarkdown(text: string): React.ReactNode {
  // Bold **text**, italic *text*, inline `code`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="rounded bg-[#f4f5f7] px-1 py-0.5 font-mono text-xs text-[#172b4d]">{part.slice(1, -1)}</code>;
    return part;
  });
}

// ── Checklist ──
interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

function Checklist() {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: "1", text: "Review design mockups", done: true },
    { id: "2", text: "Write unit tests", done: false },
    { id: "3", text: "Update documentation", done: false },
  ]);
  const [newText, setNewText] = useState("");

  const done = items.filter((i) => i.done).length;
  const pct = items.length === 0 ? 0 : Math.round((done / items.length) * 100);

  const toggle = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));

  const add = () => {
    if (!newText.trim()) return;
    setItems((prev) => [...prev, { id: Date.now().toString(), text: newText.trim(), done: false }]);
    setNewText("");
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-3 flex items-center gap-2">
        <span className="w-8 text-right text-[11px] font-semibold text-[#5e6c84]">{pct}%</span>
        <div className="flex-1 h-2 rounded-full bg-[#dfe1e6] overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              pct === 100 ? "bg-[#5aac44]" : "bg-[#0079bf]"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <ul className="space-y-1.5 mb-3">
        {items.map((item) => (
          <li key={item.id} className="group flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggle(item.id)}
              className="h-4 w-4 rounded accent-[#0079bf] cursor-pointer"
            />
            <span className={cn("flex-1 text-sm text-[#172b4d]", item.done && "line-through text-[#5e6c84]")}>
              {item.text}
            </span>
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-[#5e6c84] hover:bg-[#f4f5f7] hover:text-red-500 transition-opacity"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add an item…"
          className="flex-1 rounded border border-[#dfe1e6] bg-white px-2.5 py-1.5 text-sm text-[#172b4d] placeholder:text-[#a5adba] focus:border-[#0079bf] focus:outline-none focus:ring-1 focus:ring-[#0079bf]/30"
        />
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 rounded bg-[#0079bf] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#026aa7]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
    </div>
  );
}

// ── Main Dialog ──
interface CardDetailDialogProps {
  card: DummyCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardDetailDialog({ card, open, onOpenChange }: CardDetailDialogProps) {
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [description, setDescription] = useState(card?.description ?? "");

  if (!card) return null;

  const isDueToday = card.dueDate ? isToday(new Date(card.dueDate)) : false;
  const isOverdue = card.dueDate ? new Date(card.dueDate) < new Date() && !isDueToday : false;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px]" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[101] w-[min(100vw-2rem,768px)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2",
            "rounded-xl bg-[#f4f5f7] shadow-2xl outline-none overflow-hidden"
          )}
        >
          {/* Header */}
          <div className="flex items-start gap-3 bg-white px-6 py-4 border-b border-[#dfe1e6]">
            <AlignLeft className="mt-0.5 h-5 w-5 shrink-0 text-[#5e6c84]" />
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-lg font-bold leading-snug text-[#172b4d]">
                {card.title}
              </Dialog.Title>
              {card.labels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {card.labels.map((label: DummyLabel) => (
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
            </div>
            <Dialog.Close className="shrink-0 rounded-md p-1.5 text-[#5e6c84] hover:bg-[#f4f5f7] hover:text-[#172b4d]">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Two-column body */}
          <div className="flex max-h-[calc(90vh-80px)] overflow-y-auto">
            {/* Left: main content */}
            <div className="flex-1 min-w-0 px-6 py-5 space-y-6">
              {/* Description */}
              <section>
                <div className="mb-2 flex items-center gap-2">
                  <AlignLeft className="h-4 w-4 text-[#5e6c84]" />
                  <h3 className="text-sm font-semibold text-[#172b4d]">Description</h3>
                </div>
                {isEditingDesc ? (
                  <div>
                    <textarea
                      autoFocus
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="w-full rounded-lg border border-[#0079bf] bg-white px-3 py-2 text-sm text-[#172b4d] focus:outline-none focus:ring-2 focus:ring-[#0079bf]/30 resize-none"
                      placeholder="Add a description… (supports **bold**, *italic*, `code`)"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingDesc(false)}
                        className="rounded bg-[#0079bf] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#026aa7]"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDescription(card.description ?? ""); setIsEditingDesc(false); }}
                        className="rounded px-3 py-1.5 text-xs font-medium text-[#5e6c84] hover:bg-[#dfe1e6]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingDesc(true)}
                    className="min-h-[64px] cursor-text rounded-lg bg-[#ebecf0] px-3 py-2.5 hover:bg-[#dfe1e6] transition-colors"
                  >
                    {description ? (
                      <div className="prose-sm">{renderMarkdown(description)}</div>
                    ) : (
                      <p className="text-sm italic text-[#a5adba]">
                        Add a more detailed description… (supports **bold**, *italic*, `code`)
                      </p>
                    )}
                  </div>
                )}
              </section>

              {/* Checklist */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-[#5e6c84]" />
                  <h3 className="text-sm font-semibold text-[#172b4d]">Checklist</h3>
                </div>
                <Checklist />
              </section>

              {/* Activity */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#5e6c84]" />
                  <h3 className="text-sm font-semibold text-[#172b4d]">Activity</h3>
                </div>
                <div className="space-y-3">
                  {card._count.activityLogs > 0 ? (
                    Array.from({ length: Math.min(card._count.activityLogs, 4) }).map((_, i) => (
                      <div key={i} className="flex gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5aac44] to-[#0079bf] text-[10px] font-bold text-white">
                          {card.assignees[0]?.name.slice(0, 2).toUpperCase() ?? "U"}
                        </div>
                        <div className="flex-1 rounded-lg bg-white px-3 py-2 text-sm text-[#172b4d] shadow-[0_1px_0_rgba(9,30,66,0.13)]">
                          <span className="font-semibold">{card.assignees[0]?.name ?? "User"}</span>
                          {" "}made a change to this card
                          <p className="mt-0.5 text-[11px] text-[#5e6c84]">
                            {new Date(Date.now() - i * 3600000).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm italic text-[#a5adba]">No activity yet.</p>
                  )}
                </div>
              </section>
            </div>

            {/* Right: action sidebar */}
            <div className="w-[168px] shrink-0 border-l border-[#dfe1e6] bg-white px-3 py-5 space-y-4">
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5e6c84]">
                  Add to card
                </p>
                <div className="space-y-1">
                  {[
                    { icon: Users, label: "Members" },
                    { icon: Tag, label: "Labels" },
                    { icon: CheckSquare, label: "Checklist" },
                    { icon: Calendar, label: "Dates" },
                  ].map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md bg-[#f4f5f7] px-3 py-1.5 text-xs font-medium text-[#172b4d] hover:bg-[#ebecf0] transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#5e6c84]" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Members */}
              {card.assignees.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5e6c84]">
                    Members
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {card.assignees.map((user) => (
                      <div
                        key={user.id}
                        title={user.name}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#5aac44] to-[#0079bf] text-[10px] font-bold text-white"
                      >
                        {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Due date */}
              {card.dueDate && (
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5e6c84]">
                    Due Date
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
                      isOverdue && "bg-red-100 text-red-700",
                      isDueToday && "bg-amber-100 text-amber-800",
                      !isOverdue && !isDueToday && "bg-[#f4f5f7] text-[#172b4d]"
                    )}
                  >
                    <Calendar className="h-3 w-3" />
                    {new Date(card.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5e6c84]">
                  Actions
                </p>
                <div className="space-y-1">
                  {["Move", "Copy", "Archive"].map((action) => (
                    <button
                      key={action}
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md bg-[#f4f5f7] px-3 py-1.5 text-xs font-medium text-[#172b4d] hover:bg-[#ebecf0] transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

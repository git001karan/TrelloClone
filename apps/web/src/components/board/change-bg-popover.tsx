"use client";

import * as Popover from "@radix-ui/react-popover";
import { Image, X } from "lucide-react";
import { cn } from "@/lib/utils";

const GRADIENTS = [
  { label: "Ocean", value: "#0079bf" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Emerald", value: "#059669" },
  { label: "Crimson", value: "#dc2626" },
  { label: "Amber", value: "#d97706" },
  { label: "Cyan", value: "#0891b2" },
  { label: "Indigo", value: "#4f46e5" },
  { label: "Rose", value: "#be185d" },
];

// Curated Unsplash photos (direct image URLs)
const PHOTOS = [
  {
    label: "Mountains",
    value:
      "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80) center/cover no-repeat",
    thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=60",
  },
  {
    label: "Forest",
    value:
      "url(https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=80) center/cover no-repeat",
    thumb: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=60",
  },
  {
    label: "Ocean",
    value:
      "url(https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1600&q=80) center/cover no-repeat",
    thumb: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=200&q=60",
  },
  {
    label: "City",
    value:
      "url(https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=80) center/cover no-repeat",
    thumb: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200&q=60",
  },
  {
    label: "Desert",
    value:
      "url(https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600&q=80) center/cover no-repeat",
    thumb: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=200&q=60",
  },
  {
    label: "Aurora",
    value:
      "url(https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&q=80) center/cover no-repeat",
    thumb: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&q=60",
  },
];

interface ChangeBgPopoverProps {
  onSelect: (background: string) => void;
}

export function ChangeBgPopover({ onSelect }: ChangeBgPopoverProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-white/25"
        >
          <Image className="h-3.5 w-3.5" />
          Background
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-50 w-72 rounded-xl border border-white/10 bg-[#1d2125]/95 backdrop-blur-xl p-4 shadow-2xl animate-scale-in"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Change Background
            </span>
            <Popover.Close className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </Popover.Close>
          </div>

          {/* Photos */}
          <p className="mb-2 text-[11px] font-medium text-white/40">Photos</p>
          <div className="mb-4 grid grid-cols-3 gap-1.5">
            {PHOTOS.map((photo) => (
              <button
                key={photo.label}
                type="button"
                onClick={() => onSelect(photo.value)}
                className={cn(
                  "group relative h-14 overflow-hidden rounded-lg transition hover:ring-2 hover:ring-white/60"
                )}
                title={photo.label}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumb}
                  alt={photo.label}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </button>
            ))}
          </div>

          {/* Colors */}
          <p className="mb-2 text-[11px] font-medium text-white/40">Colors</p>
          <div className="grid grid-cols-4 gap-1.5">
            {GRADIENTS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => onSelect(g.value)}
                className="h-10 rounded-lg transition hover:ring-2 hover:ring-white/60 hover:scale-105"
                style={{ background: g.value }}
                title={g.label}
              />
            ))}
          </div>

          <Popover.Arrow className="fill-[#1d2125]/95" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

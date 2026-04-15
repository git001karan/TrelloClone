"use client";

import { useState, useEffect } from "react";

const KEY = "trello_starred_boards";

function load(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useStarredBoards() {
  const [starredIds, setStarredIds] = useState<string[]>(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(starredIds));
  }, [starredIds]);

  const toggleStar = (id: string) => {
    setStarredIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return { starredIds, toggleStar };
}

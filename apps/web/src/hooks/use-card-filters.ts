"use client";

import { useMemo, useState } from "react";
import type { DummyBoard } from "@/lib/dummy-data";

export interface CardFilterState {
  search: string;
  labelIds: string[];
  memberIds: string[];
}

const DEFAULT_FILTERS: CardFilterState = {
  search: "",
  labelIds: [],
  memberIds: [],
};

export function useCardFilters(board: DummyBoard) {
  const [filters, setFilters] = useState<CardFilterState>(DEFAULT_FILTERS);

  const filteredBoard = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const hasSearch = search.length > 0;
    const hasLabelFilter = filters.labelIds.length > 0;
    const hasMemberFilter = filters.memberIds.length > 0;

    if (!hasSearch && !hasLabelFilter && !hasMemberFilter) {
      return board;
    }

    return {
      ...board,
      lists: board.lists.map((list) => ({
        ...list,
        cards: list.cards.filter((card) => {
          const matchesSearch = !hasSearch || card.title.toLowerCase().includes(search);
          const matchesLabel =
            !hasLabelFilter ||
            filters.labelIds.some((id) => card.labels.some((label) => label.id === id));
          const matchesMember =
            !hasMemberFilter ||
            filters.memberIds.some((id) => card.assignees.some((assignee) => assignee.id === id));
          return matchesSearch && matchesLabel && matchesMember;
        }),
      })),
    };
  }, [board, filters]);

  return {
    filters,
    setFilters,
    filteredBoard,
    clearFilters: () => setFilters(DEFAULT_FILTERS),
  };
}

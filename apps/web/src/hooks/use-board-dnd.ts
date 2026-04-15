"use client";

import { useState, useCallback, useMemo, useRef, type Dispatch, type SetStateAction } from "react";
import {
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { getPositionAtIndex } from "@/lib/position";
import type { DummyBoard, DummyCard, DummyList } from "@/lib/dummy-data";

export type DragItemType = "card" | "list";

export interface DragState {
  activeId: UniqueIdentifier | null;
  activeType: DragItemType | null;
  activeCard: DummyCard | null;
  activeList: DummyList | null;
}

export interface MoveCardPayload {
  cardId: string;
  targetListId: string;
  newPosition: number;
  previousBoard: DummyBoard;
}

export interface MoveListPayload {
  listId: string;
  newPosition: number;
  previousBoard: DummyBoard;
}

function findListByCardId(lists: DummyList[], cardId: string): DummyList | undefined {
  return lists.find((list) => list.cards.some((card) => card.id === cardId));
}

function isListId(id: string, lists: DummyList[]): boolean {
  return lists.some((list) => list.id === id);
}

export function useBoardDnD(
  board: DummyBoard,
  setBoard: Dispatch<SetStateAction<DummyBoard>>,
  onMoveCard?: (payload: MoveCardPayload) => void,
  onMoveList?: (payload: MoveListPayload) => void
) {
  const [dragState, setDragState] = useState<DragState>({
    activeId: null,
    activeType: null,
    activeCard: null,
    activeList: null,
  });

  // Use a ref to track activeType so handleDragEnd always sees the latest value
  const activeTypeRef = useRef<DragItemType | null>(null);
  const preDragBoardRef = useRef<DummyBoard | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 8 },
  });
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  const sensors = useSensors(pointerSensor, touchSensor, keyboardSensor);

  const sortedListIds = useMemo(
    () => [...board.lists].sort((a, b) => a.position - b.position).map((l) => l.id),
    [board.lists]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = event.active.id as string;
      preDragBoardRef.current = JSON.parse(JSON.stringify(board));

      if (isListId(id, board.lists)) {
        const list = board.lists.find((l) => l.id === id) ?? null;
        activeTypeRef.current = "list";
        setDragState({ activeId: id, activeType: "list", activeCard: null, activeList: list });
      } else {
        const list = findListByCardId(board.lists, id);
        const card = list?.cards.find((c) => c.id === id) ?? null;
        activeTypeRef.current = "card";
        setDragState({ activeId: id, activeType: "card", activeCard: card, activeList: null });
      }
    },
    [board]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || !active) return;
      if (activeTypeRef.current !== "card") return;

      const activeId = active.id as string;
      const overId = over.id as string;
      if (activeId === overId) return;

      const activeList = findListByCardId(board.lists, activeId);
      let overList: DummyList | undefined;

      if (isListId(overId, board.lists)) {
        overList = board.lists.find((l) => l.id === overId);
      } else {
        overList = findListByCardId(board.lists, overId);
      }

      if (!activeList || !overList) return;
      if (activeList.id === overList.id) return;

      // Cross-list move — update UI optimistically
      setBoard((prev) => {
        const srcList = prev.lists.find((l) => l.id === activeList.id);
        const dstList = prev.lists.find((l) => l.id === overList!.id);
        if (!srcList || !dstList) return prev;

        const movingCard = srcList.cards.find((c) => c.id === activeId);
        if (!movingCard) return prev;

        const dstCards = [...dstList.cards].sort((a, b) => a.position - b.position);
        let insertIndex = dstCards.length;

        if (!isListId(overId, prev.lists)) {
          const idx = dstCards.findIndex((c) => c.id === overId);
          if (idx !== -1) insertIndex = idx;
        }

        const newPosition = getPositionAtIndex(dstCards.map((c) => c.position), insertIndex);
        const updatedCard = { ...movingCard, listId: overList!.id, position: newPosition };

        return {
          ...prev,
          lists: prev.lists.map((list) => {
            if (list.id === activeList.id) {
              return { ...list, cards: list.cards.filter((c) => c.id !== activeId) };
            }
            if (list.id === overList!.id) {
              const newCards = [...list.cards.filter((c) => c.id !== activeId)];
              newCards.splice(insertIndex, 0, updatedCard);
              return { ...list, cards: newCards };
            }
            return list;
          }),
        };
      });
    },
    [board, setBoard]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const type = activeTypeRef.current; // Read from ref — never stale

      // Reset state
      activeTypeRef.current = null;
      setDragState({ activeId: null, activeType: null, activeCard: null, activeList: null });

      if (!over) {
        // Cancelled — rollback
        if (preDragBoardRef.current) {
          setBoard(preDragBoardRef.current);
        }
        preDragBoardRef.current = null;
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      // ── List reorder ──────────────────────────────
      if (type === "list") {
        if (activeId === overId) { preDragBoardRef.current = null; return; }

        setBoard((prev) => {
          const previousBoard = preDragBoardRef.current ?? JSON.parse(JSON.stringify(prev));
          preDragBoardRef.current = null;

          const sorted = [...prev.lists].sort((a, b) => a.position - b.position);
          const activeIdx = sorted.findIndex((l) => l.id === activeId);
          const overIdx = sorted.findIndex((l) => l.id === overId);
          if (activeIdx === -1 || overIdx === -1 || activeIdx === overIdx) return prev;

          const otherPositions = sorted.filter((l) => l.id !== activeId).map((l) => l.position);
          const newPosition = getPositionAtIndex(otherPositions, overIdx);

          onMoveList?.({ listId: activeId, newPosition, previousBoard });

          return {
            ...prev,
            lists: prev.lists.map((l) => l.id === activeId ? { ...l, position: newPosition } : l),
          };
        });
        return;
      }

      // ── Card reorder / finalize cross-list ────────
      if (type === "card") {
        setBoard((prev) => {
          const previousBoard = preDragBoardRef.current ?? JSON.parse(JSON.stringify(prev));
          preDragBoardRef.current = null;

          // After handleDragOver, the card is already in its target list
          const currentList = findListByCardId(prev.lists, activeId);
          if (!currentList) return prev;

          const sorted = [...currentList.cards].sort((a, b) => a.position - b.position);
          const activeIdx = sorted.findIndex((c) => c.id === activeId);

          // Determine overIndex
          let overIdx: number;
          if (isListId(overId, prev.lists)) {
            // Dropped directly on a list container
            overIdx = sorted.length - 1;
          } else {
            overIdx = sorted.findIndex((c) => c.id === overId);
          }

          // If overIdx not found (cross-list drop already handled by DragOver), just persist current position
          if (activeIdx === -1) return prev;

          const card = sorted[activeIdx];
          const targetListId = currentList.id;

          if (overIdx === -1 || activeIdx === overIdx) {
            // Just persist the current position from DragOver
            onMoveCard?.({ cardId: activeId, targetListId, newPosition: card.position, previousBoard });
            return prev;
          }

          const otherPositions = sorted.filter((c) => c.id !== activeId).map((c) => c.position);
          const newPosition = getPositionAtIndex(otherPositions, overIdx);

          onMoveCard?.({ cardId: activeId, targetListId, newPosition, previousBoard });

          return {
            ...prev,
            lists: prev.lists.map((list) => {
              if (list.id !== currentList.id) return list;
              return {
                ...list,
                cards: list.cards.map((c) => c.id === activeId ? { ...c, position: newPosition } : c),
              };
            }),
          };
        });
      }
    },
    [setBoard, onMoveCard, onMoveList]
  );

  const handleDragCancel = useCallback(() => {
    activeTypeRef.current = null;
    if (preDragBoardRef.current) {
      setBoard(preDragBoardRef.current);
      preDragBoardRef.current = null;
    }
    setDragState({ activeId: null, activeType: null, activeCard: null, activeList: null });
  }, [setBoard]);

  return {
    dragState,
    sensors,
    sortedListIds,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}

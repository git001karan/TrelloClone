"use client";

import { useState, useCallback, useMemo, useRef, type Dispatch, type SetStateAction } from "react";
import {
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { getPositionAtIndex } from "@/lib/position";
import type { DummyBoard, DummyCard, DummyList } from "@/lib/dummy-data";

// ─── Types ───────────────────────────────────────────

export type DragItemType = "card" | "list";

export interface DragState {
  activeId: UniqueIdentifier | null;
  activeType: DragItemType | null;
  activeCard: DummyCard | null;
  activeList: DummyList | null;
  overId: UniqueIdentifier | null;
  overListId: string | null;
}

export interface MoveCardPayload {
  cardId: string;
  targetListId: string;
  newPosition: number;
  /** Snapshot before this move — used to rollback on API failure */
  previousBoard: DummyBoard;
}

export interface MoveListPayload {
  listId: string;
  newPosition: number;
  previousBoard: DummyBoard;
}

// ─── Helper: Find which list a card belongs to ───────

function findListByCardId(
  lists: DummyList[],
  cardId: string
): DummyList | undefined {
  return lists.find((list) =>
    list.cards.some((card) => card.id === cardId)
  );
}

// ─── Helper: Check if ID is a list ──────────────────

function isListId(id: string, lists: DummyList[]): boolean {
  return lists.some((list) => list.id === id);
}

/**
 * useBoardDnD — Custom hook encapsulating all drag-and-drop logic.
 *
 * Handles three scenarios:
 *   1. Reorder cards WITHIN the same list
 *   2. Move cards BETWEEN different lists
 *   3. Reorder lists horizontally
 *
 * Uses the Decimal Positioning System for position calculations,
 * ensuring only the moved item gets a new position value.
 */
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
    overId: null,
    overListId: null,
  });

  // Track the original state before drag for rollback on error
  const preDragBoardRef = useRef<DummyBoard | null>(null);

  // ─── Sensors ─────────────────────────────────────
  // Pointer sensor with 5px activation distance prevents accidental drags
  // Touch sensor with 200ms delay for mobile
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 5,
    },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  // ─── Sorted list IDs for SortableContext ─────────
  const sortedListIds = useMemo(
    () =>
      [...board.lists]
        .sort((a, b) => a.position - b.position)
        .map((l) => l.id),
    [board.lists]
  );

  // ─── DragStart ───────────────────────────────────
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const id = active.id as string;

      // Save pre-drag state for potential rollback
      preDragBoardRef.current = JSON.parse(JSON.stringify(board));

      if (isListId(id, board.lists)) {
        const list = board.lists.find((l) => l.id === id);
        setDragState({
          activeId: id,
          activeType: "list",
          activeCard: null,
          activeList: list || null,
          overId: null,
          overListId: null,
        });
      } else {
        const list = findListByCardId(board.lists, id);
        const card = list?.cards.find((c) => c.id === id);
        setDragState({
          activeId: id,
          activeType: "card",
          activeCard: card || null,
          activeList: null,
          overId: null,
          overListId: list?.id || null,
        });
      }
    },
    [board]
  );

  // ─── DragOver ────────────────────────────────────
  // This fires CONTINUOUSLY during drag. For card drags,
  // we move cards between lists in real-time (optimistic).
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || !active) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Only handle card-level cross-list moves
      if (dragState.activeType !== "card") return;
      if (activeId === overId) return;

      const activeList = findListByCardId(board.lists, activeId);
      // Determine the target list — either the card's list or the list itself
      let overList: DummyList | undefined;

      if (isListId(overId, board.lists)) {
        overList = board.lists.find((l) => l.id === overId);
      } else {
        overList = findListByCardId(board.lists, overId);
      }

      if (!activeList || !overList) return;

      // If same list, skip — sorting handles this in DragEnd
      if (activeList.id === overList.id) return;

      // CROSS-LIST MOVE: Move the card from one list to another
      setBoard((prev) => {
        const activeListData = prev.lists.find((l) => l.id === activeList.id);
        const overListData = prev.lists.find((l) => l.id === overList!.id);
        if (!activeListData || !overListData) return prev;

        const movingCard = activeListData.cards.find((c) => c.id === activeId);
        if (!movingCard) return prev;

        // Find the index where we should insert in the target list
        const overCards = [...overListData.cards].sort(
          (a, b) => a.position - b.position
        );
        let insertIndex = overCards.length; // Default: end

        if (!isListId(overId, prev.lists)) {
          // Hovering over a card — insert at that card's index
          const overCardIndex = overCards.findIndex((c) => c.id === overId);
          if (overCardIndex !== -1) {
            insertIndex = overCardIndex;
          }
        }

        // Calculate new position using decimal positioning
        const otherPositions = overCards.map((c) => c.position);
        const newPosition = getPositionAtIndex(otherPositions, insertIndex);

        const updatedCard = {
          ...movingCard,
          listId: overList!.id,
          position: newPosition,
        };

        return {
          ...prev,
          lists: prev.lists.map((list) => {
            if (list.id === activeList.id) {
              // Remove from source list
              return {
                ...list,
                cards: list.cards.filter((c) => c.id !== activeId),
              };
            }
            if (list.id === overList!.id) {
              // Add to target list at correct position
              const newCards = [...list.cards.filter((c) => c.id !== activeId)];
              newCards.splice(insertIndex, 0, updatedCard);
              return {
                ...list,
                cards: newCards,
              };
            }
            return list;
          }),
        };
      });
    },
    [board, dragState.activeType, setBoard]
  );

  // ─── DragEnd ─────────────────────────────────────
  // Final position is calculated here. This is where we
  // commit the move and fire the mutation callback.
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      
      // Reset drag state first
      setDragState({
        activeId: null,
        activeType: null,
        activeCard: null,
        activeList: null,
        overId: null,
        overListId: null,
      });

      if (!over || active.id === over.id) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // ─── List Reorder ────────────────────────
      if (dragState.activeType === "list") {
        setBoard((prev) => {
          const previousBoard = JSON.parse(JSON.stringify(prev)) as DummyBoard;
          const sortedLists = [...prev.lists].sort(
            (a, b) => a.position - b.position
          );

          const activeIndex = sortedLists.findIndex(
            (l) => l.id === activeId
          );
          const overIndex = sortedLists.findIndex((l) => l.id === overId);

          if (activeIndex === -1 || overIndex === -1) return prev;
          if (activeIndex === overIndex) return prev;

          // Calculate new position using decimal positioning
          const otherPositions = sortedLists
            .filter((l) => l.id !== activeId)
            .map((l) => l.position);
          const newPosition = getPositionAtIndex(otherPositions, overIndex);

          onMoveList?.({
            listId: activeId,
            newPosition,
            previousBoard,
          });

          return {
            ...prev,
            lists: prev.lists.map((list) =>
              list.id === activeId
                ? { ...list, position: newPosition }
                : list
            ),
          };
        });
        return;
      }

      // ─── Card Reorder (within same list or finalize cross-list) ──
      if (dragState.activeType === "card") {
        setBoard((prev) => {
          const previousBoard = JSON.parse(JSON.stringify(prev)) as DummyBoard;
          const currentList = findListByCardId(prev.lists, activeId);
          if (!currentList) return prev;

          const sortedCards = [...currentList.cards].sort(
            (a, b) => a.position - b.position
          );

          const activeIndex = sortedCards.findIndex(
            (c) => c.id === activeId
          );
          let overIndex: number;

          if (isListId(overId, prev.lists)) {
            // Dropped on an empty list — card should already be moved by DragOver
            overIndex = 0;
          } else {
            overIndex = sortedCards.findIndex((c) => c.id === overId);
          }

          if (activeIndex === -1 || overIndex === -1) return prev;
          if (activeIndex === overIndex) return prev;

          // Calculate new position
          const otherPositions = sortedCards
            .filter((c) => c.id !== activeId)
            .map((c) => c.position);
          const newPosition = getPositionAtIndex(otherPositions, overIndex);

          onMoveCard?.({
            cardId: activeId,
            targetListId: currentList.id,
            newPosition,
            previousBoard,
          });

          return {
            ...prev,
            lists: prev.lists.map((list) => {
              if (list.id !== currentList.id) return list;
              return {
                ...list,
                cards: list.cards.map((card) =>
                  card.id === activeId
                    ? { ...card, position: newPosition }
                    : card
                ),
              };
            }),
          };
        });
      }
    },
    [dragState.activeType, setBoard, onMoveCard, onMoveList]
  );

  // ─── DragCancel ──────────────────────────────────
  const handleDragCancel = useCallback(() => {
    // Rollback to pre-drag state
    if (preDragBoardRef.current) {
      setBoard(preDragBoardRef.current);
      preDragBoardRef.current = null;
    }
    setDragState({
      activeId: null,
      activeType: null,
      activeCard: null,
      activeList: null,
      overId: null,
      overListId: null,
    });
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

"use client";

import Link from "next/link";
import { useState, useCallback, useMemo, type SetStateAction } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ListColumn } from "./list-column";
import { CardItem } from "./card-item";
import { AddList } from "./add-list";
import { BoardHeader } from "./board-header";
import { ActivityDrawer } from "./activity-drawer";
import { CardDetailDialog } from "./card-detail-dialog";
import { useBoardMutations } from "@/hooks/use-board-mutations";
import { useBoardDnD } from "@/hooks/use-board-dnd";
import { useCardFilters } from "@/hooks/use-card-filters";
import { useAuth } from "@/hooks/use-auth";
import { useBoardSocket } from "@/hooks/use-board-socket";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";
import { boardKeys } from "@/lib/board-query-keys";
import { mapApiBoardToDummy, type ApiBoard } from "@/lib/map-api-board";
import { dummyBoard, type DummyBoard, type DummyCard } from "@/lib/dummy-data";

export interface BoardViewProps {
  /** When set (e.g. from `/board/[id]`), load that board; otherwise first board from API */
  boardId?: string | null;
}

export function BoardView({ boardId: boardIdProp }: BoardViewProps) {
  const queryClient = useQueryClient();
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const { logout } = useAuth();

  const boardsQuery = useQuery({
    queryKey: boardKeys.boards(),
    queryFn: () => apiGet<Array<{ id: string; title?: string; background?: string }>>("/boards"),
    retry: false,
  });

  const resolvedBoardId = useMemo(() => {
    if (boardIdProp) return boardIdProp;
    return boardsQuery.data?.[0]?.id ?? null;
  }, [boardIdProp, boardsQuery.data]);

  const boardQuery = useQuery({
    queryKey: boardKeys.detail(resolvedBoardId ?? ""),
    queryFn: async () => {
      const raw = await apiGet<ApiBoard>(`/boards/${resolvedBoardId}`);
      return mapApiBoardToDummy(raw);
    },
    enabled: !!resolvedBoardId,
    retry: false,
  });

  // Real-time sync via Socket.io
  useBoardSocket(resolvedBoardId);

  // Local background override (Change Background popover)
  const [bgOverride, setBgOverride] = useState<string | null>(null);

  const board: DummyBoard = useMemo(() => {
    if (boardQuery.data) return boardQuery.data;
    if (boardsQuery.isError || boardQuery.isError) return dummyBoard;
    return dummyBoard;
  }, [boardQuery.data, boardQuery.isError, boardsQuery.isError]);

  const setBoard = useCallback(
    (updater: SetStateAction<DummyBoard>) => {
      if (!resolvedBoardId) return;
      queryClient.setQueryData<DummyBoard>(
        boardKeys.detail(resolvedBoardId),
        (old) => {
          const base = old ?? board;
          return typeof updater === "function"
            ? (updater as (b: DummyBoard) => DummyBoard)(base)
            : updater;
        }
      );
    },
    [queryClient, resolvedBoardId, board]
  );

  const { moveCardMutation, moveListMutation } = useBoardMutations(resolvedBoardId);

  const { filters, setFilters, filteredBoard } = useCardFilters(board);

  const handleMoveCard = useCallback(
    (payload: {
      cardId: string;
      targetListId: string;
      newPosition: number;
      previousBoard: DummyBoard;
    }) => {
      moveCardMutation.mutate(payload);
    },
    [moveCardMutation]
  );

  const handleMoveList = useCallback(
    (payload: {
      listId: string;
      newPosition: number;
      previousBoard: DummyBoard;
    }) => {
      moveListMutation.mutate({
        ...payload,
        boardId: board.id,
      });
    },
    [moveListMutation, board.id]
  );

  const {
    dragState,
    sensors,
    sortedListIds,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useBoardDnD(board, setBoard, handleMoveCard, handleMoveList);

  const handleAddCard = useCallback(
    async (listId: string, title: string) => {
      try {
        // Create card via API so it gets a real DB ID
        const newCard = await apiPost<{
          id: string; title: string; description: string | null;
          position: number; dueDate: string | null; listId: string;
          labels: []; assignees: []; _count: { activityLogs: number };
        }, { title: string; listId: string }>("/cards", { title, listId });

        setBoard((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => {
            if (list.id !== listId) return list;
            const card: DummyCard = {
              id: newCard.id,
              title: newCard.title,
              description: null,
              position: newCard.position,
              dueDate: null,
              listId,
              labels: [],
              assignees: [],
              _count: { activityLogs: 0 },
            };
            return { ...list, cards: [...list.cards, card] };
          }),
        }));
      } catch {
        toast.error("Could not add card");
      }
    },
    [setBoard]
  );

  const handleAddList = useCallback(
    async (title: string) => {
      try {
        const newList = await apiPost<{
          id: string; title: string; position: number; boardId: string;
        }, { title: string; boardId: string }>("/lists", { title, boardId: board.id });

        setBoard((prev) => ({
          ...prev,
          lists: [...prev.lists, {
            id: newList.id,
            title: newList.title,
            position: newList.position,
            boardId: newList.boardId,
            cards: [],
          }],
        }));
      } catch {
        toast.error("Could not add list");
      }
    },
    [setBoard, board.id]
  );

  const handleUpdateListTitle = useCallback(
    (listId: string, title: string) => {
      setBoard((prev) => ({
        ...prev,
        lists: prev.lists.map((list) =>
          list.id === listId ? { ...list, title } : list
        ),
      }));
    },
    [setBoard]
  );

  const handleDeleteList = useCallback(
    (listId: string) => {
      setBoard((prev) => ({
        ...prev,
        lists: prev.lists.filter((l) => l.id !== listId),
      }));
    },
    [setBoard]
  );

  const selectedCard = useMemo(() => {
    if (!selectedCardId) return null;
    for (const list of board.lists) {
      const c = list.cards.find((x) => x.id === selectedCardId);
      if (c) return c;
    }
    return null;
  }, [board.lists, selectedCardId]);

  const sortedLists = [...filteredBoard.lists].sort(
    (a, b) => a.position - b.position
  );

  const isLoadingBoard =
    !!resolvedBoardId && boardQuery.isLoading && !boardQuery.data;

  if (boardsQuery.isSuccess && boardsQuery.data?.length === 0 && !boardIdProp) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f4f5f7] px-4 text-center">
        <h1 className="text-2xl font-bold text-[#172b4d]">No boards yet</h1>
        <p className="max-w-md text-sm text-[#5e6c84]">
          Create a board from the workspace home, or open a board you have access to.
        </p>
        <Link
          href="/"
          className="rounded-md bg-[#0079bf] px-4 py-2 text-sm font-semibold text-white hover:bg-[#026aa7]"
        >
          Back to workspace
        </Link>
      </div>
    );
  }

  if (resolvedBoardId && boardQuery.isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f4f5f7] px-4 text-center">
        <h1 className="text-xl font-bold text-[#172b4d]">Board unavailable</h1>
        <p className="max-w-md text-sm text-[#5e6c84]">
          This board could not be loaded. You may not have access, or the API is offline.
        </p>
        <Link
          href="/"
          className="rounded-md bg-[#0079bf] px-4 py-2 text-sm font-semibold text-white hover:bg-[#026aa7]"
        >
          Back to boards
        </Link>
      </div>
    );
  }

  const activeBg = bgOverride ?? board.background;
  const isPhotoBg = activeBg?.startsWith("url(");

  return (
    <AppSidebar>
    <div
      className="flex h-full flex-col trello-board-bg"
      style={
        isPhotoBg
          ? { background: activeBg } as React.CSSProperties
          : { "--board-accent": activeBg } as React.CSSProperties
      }
    >
      <BoardHeader
        board={board}
        isLoading={isLoadingBoard}
        searchValue={filters.search}
        selectedLabelId={filters.labelIds[0] || ""}
        selectedMemberId={filters.memberIds[0] || ""}
        onSearchChange={(value) =>
          setFilters((prev) => ({ ...prev, search: value }))
        }
        onLabelChange={(value) =>
          setFilters((prev) => ({
            ...prev,
            labelIds: value ? [value] : [],
          }))
        }
        onMemberChange={(value) =>
          setFilters((prev) => ({
            ...prev,
            memberIds: value ? [value] : [],
          }))
        }
        onOpenActivity={() => setIsActivityOpen(true)}
        onLogout={logout}
        onChangeBg={setBgOverride}
      />

      {isLoadingBoard ? (
        <div className="flex flex-1 items-start gap-4 px-6 pb-6 pt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 w-[272px] shrink-0 animate-pulse rounded-xl bg-black/10"
            />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          measuring={{
            droppable: { strategy: MeasuringStrategy.Always },
          }}
        >
          <SortableContext
            items={sortedListIds}
            strategy={horizontalListSortingStrategy}
          >
            <div className="board-scroll flex flex-1 items-start gap-3 px-5 pb-8 pt-3">
              {sortedLists.map((list) => (
                <ListColumn
                  key={list.id}
                  list={list}
                  onAddCard={handleAddCard}
                  onEditCard={(id) => setSelectedCardId(id)}
                  onUpdateTitle={handleUpdateListTitle}
                  onDeleteList={handleDeleteList}
                />
              ))}
              <AddList onAdd={handleAddList} />
            </div>
          </SortableContext>

          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            }}
          >
            {dragState.activeType === "card" && dragState.activeCard && (
              <div className="w-[256px]">
                <CardItem card={dragState.activeCard} isDragOverlay />
              </div>
            )}
            {dragState.activeType === "list" && dragState.activeList && (
              <div className="w-[272px]">
                <ListColumn
                  list={dragState.activeList}
                  onAddCard={() => {}}
                  isDragOverlay
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      <ActivityDrawer
        boardId={board.id}
        open={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
      />

      <CardDetailDialog
        card={selectedCard}
        open={selectedCardId !== null && selectedCard !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedCardId(null);
        }}
      />
    </div>
    </AppSidebar>
  );
}

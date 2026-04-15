"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { MoveCardDto, MoveListDto } from "@trello-clone/shared";
import { apiPatch } from "@/lib/api";
import { boardKeys } from "@/lib/board-query-keys";
import type { DummyBoard } from "@/lib/dummy-data";

interface MoveCardArgs {
  cardId: string;
  targetListId: string;
  newPosition: number;
  previousBoard: DummyBoard;
}

interface MoveListArgs {
  listId: string;
  boardId: string;
  newPosition: number;
  previousBoard: DummyBoard;
}

export function useBoardMutations(boardId: string | null) {
  const queryClient = useQueryClient();

  const moveCardMutation = useMutation({
    mutationFn: async ({
      cardId,
      targetListId,
      newPosition,
    }: MoveCardArgs) =>
      apiPatch<unknown, MoveCardDto>(`/cards/${cardId}/move`, {
        targetListId,
        newPosition,
      }),
    onError: (_err, variables) => {
      if (boardId) {
        queryClient.setQueryData(boardKeys.detail(boardId), variables.previousBoard);
      }
      toast.error("Could not save card position", {
        description: "Your board was reverted. Try again.",
      });
    },
    onSuccess: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      }
    },
  });

  const moveListMutation = useMutation({
    mutationFn: async ({
      listId,
      boardId: bid,
      newPosition,
    }: MoveListArgs) =>
      apiPatch<unknown, MoveListDto>(`/lists/${listId}/move`, {
        boardId: bid,
        newPosition,
      }),
    onError: (_err, variables) => {
      if (boardId) {
        queryClient.setQueryData(boardKeys.detail(boardId), variables.previousBoard);
      }
      toast.error("Could not save list order", {
        description: "Your board was reverted. Try again.",
      });
    },
    onSuccess: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      }
    },
  });

  return {
    moveCardMutation,
    moveListMutation,
  };
}

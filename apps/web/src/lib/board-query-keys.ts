export const boardKeys = {
  boards: () => ["boards"] as const,
  detail: (boardId: string) => ["board", boardId] as const,
};

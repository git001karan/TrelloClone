import type { DummyBoard, DummyCard, DummyList } from "@/lib/dummy-data";

export interface ApiBoard {
  id: string;
  title: string;
  description: string | null;
  background: string;
  lists: Array<{
    id: string;
    title: string;
    position: number;
    boardId: string;
    cards: Array<{
      id: string;
      title: string;
      description: string | null;
      position: number;
      dueDate: string | null;
      listId: string;
      labels: Array<{ label: { id: string; name: string; color: string } }>;
      assignees: Array<{ user: { id: string; name: string; avatarUrl: string | null } }>;
      _count: { activityLogs: number };
    }>;
  }>;
  labels: Array<{ id: string; name: string; color: string }>;
  members: Array<{
    role: string;
    user: { id: string; name: string; email: string; avatarUrl: string | null };
  }>;
}

export function mapApiBoardToDummy(board: ApiBoard): DummyBoard {
  return {
    id: board.id,
    title: board.title,
    description: board.description,
    background: board.background,
    labels: board.labels,
    members: board.members,
    lists: board.lists.map((list): DummyList => ({
      id: list.id,
      title: list.title,
      position: list.position,
      boardId: list.boardId,
      cards: list.cards.map((card): DummyCard => ({
        id: card.id,
        title: card.title,
        description: card.description,
        position: card.position,
        dueDate: card.dueDate,
        listId: card.listId,
        labels: card.labels.map((item) => item.label),
        assignees: card.assignees.map((item) => ({
          id: item.user.id,
          name: item.user.name,
          email: "",
          avatarUrl: item.user.avatarUrl,
        })),
        _count: { activityLogs: card._count.activityLogs },
      })),
    })),
  };
}

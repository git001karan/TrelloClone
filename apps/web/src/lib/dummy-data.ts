/**
 * Dummy data for Phase 3 UI development.
 * Mimics the shape returned by the real API.
 */

export interface DummyUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface DummyLabel {
  id: string;
  name: string;
  color: string;
}

export interface DummyCard {
  id: string;
  title: string;
  description: string | null;
  position: number;
  dueDate: string | null;
  listId: string;
  labels: DummyLabel[];
  assignees: DummyUser[];
  _count: { activityLogs: number };
}

export interface DummyList {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: DummyCard[];
}

export interface DummyBoard {
  id: string;
  title: string;
  description: string | null;
  background: string;
  lists: DummyList[];
  labels: DummyLabel[];
  members: { user: DummyUser; role: string }[];
}

// ─── Users ───────────────────────────────────────────

const users: DummyUser[] = [
  { id: "user-1", name: "Alex Chen", email: "alex@trello.dev", avatarUrl: null },
  { id: "user-2", name: "Sarah Kim", email: "sarah@trello.dev", avatarUrl: null },
  { id: "user-3", name: "Marcus Johnson", email: "marcus@trello.dev", avatarUrl: null },
];

// ─── Labels ──────────────────────────────────────────

const labels: DummyLabel[] = [
  { id: "label-1", name: "Bug", color: "#ef4444" },
  { id: "label-2", name: "Feature", color: "#3b82f6" },
  { id: "label-3", name: "Enhancement", color: "#8b5cf6" },
  { id: "label-4", name: "Urgent", color: "#f59e0b" },
  { id: "label-5", name: "Documentation", color: "#10b981" },
  { id: "label-6", name: "Design", color: "#ec4899" },
];

// ─── Cards ───────────────────────────────────────────

const backlogCards: DummyCard[] = [
  {
    id: "card-1",
    title: "Research competitor features",
    description: "Analyze top 5 competitors and document their key features, pricing, and UX patterns.",
    position: 1000,
    dueDate: null,
    listId: "list-1",
    labels: [labels[1]],
    assignees: [users[0]],
    _count: { activityLogs: 3 },
  },
  {
    id: "card-2",
    title: "Define MVP scope document",
    description: "Create a comprehensive document outlining the minimum viable product features.",
    position: 2000,
    dueDate: "2026-04-30T00:00:00Z",
    listId: "list-1",
    labels: [labels[4]],
    assignees: [users[0], users[1]],
    _count: { activityLogs: 5 },
  },
  {
    id: "card-3",
    title: "Write technical specification",
    description: null,
    position: 3000,
    dueDate: null,
    listId: "list-1",
    labels: [labels[4]],
    assignees: [],
    _count: { activityLogs: 1 },
  },
];

const todoCards: DummyCard[] = [
  {
    id: "card-4",
    title: "Set up CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing, linting, and deployment.",
    position: 1000,
    dueDate: "2026-04-20T00:00:00Z",
    listId: "list-2",
    labels: [labels[1], labels[2]],
    assignees: [users[2]],
    _count: { activityLogs: 2 },
  },
  {
    id: "card-5",
    title: "Design database schema",
    description: "Design and implement PostgreSQL schema with Prisma ORM including all entity relationships.",
    position: 2000,
    dueDate: null,
    listId: "list-2",
    labels: [labels[1]],
    assignees: [users[0]],
    _count: { activityLogs: 8 },
  },
  {
    id: "card-6",
    title: "Create API documentation",
    description: null,
    position: 3000,
    dueDate: "2026-05-01T00:00:00Z",
    listId: "list-2",
    labels: [labels[4]],
    assignees: [],
    _count: { activityLogs: 0 },
  },
];

const inProgressCards: DummyCard[] = [
  {
    id: "card-7",
    title: "Build authentication system",
    description: "JWT-based auth with bcrypt password hashing, registration, login, and token refresh.",
    position: 1000,
    dueDate: "2026-04-18T00:00:00Z",
    listId: "list-3",
    labels: [labels[1], labels[3]],
    assignees: [users[0], users[2]],
    _count: { activityLogs: 12 },
  },
  {
    id: "card-8",
    title: "Implement drag-and-drop",
    description: "Use @dnd-kit for card reordering within and across lists with optimistic UI updates.",
    position: 2000,
    dueDate: null,
    listId: "list-3",
    labels: [labels[1], labels[5]],
    assignees: [users[1]],
    _count: { activityLogs: 4 },
  },
];

const reviewCards: DummyCard[] = [
  {
    id: "card-9",
    title: "Board CRUD operations",
    description: "Create, read, update, delete operations for boards with proper access control.",
    position: 1000,
    dueDate: null,
    listId: "list-4",
    labels: [labels[2]],
    assignees: [users[0]],
    _count: { activityLogs: 6 },
  },
];

const doneCards: DummyCard[] = [
  {
    id: "card-10",
    title: "Project setup & monorepo config",
    description: "pnpm workspaces, TypeScript configs, Prisma schema, Express server scaffold.",
    position: 1000,
    dueDate: null,
    listId: "list-5",
    labels: [labels[2]],
    assignees: [users[0], users[1], users[2]],
    _count: { activityLogs: 15 },
  },
  {
    id: "card-11",
    title: "Set up development environment",
    description: "Docker Compose for PostgreSQL, environment variables, and developer documentation.",
    position: 2000,
    dueDate: null,
    listId: "list-5",
    labels: [labels[4]],
    assignees: [users[2]],
    _count: { activityLogs: 7 },
  },
];

// ─── Board Data ──────────────────────────────────────

export const dummyBoard: DummyBoard = {
  id: "board-1",
  title: "Project Alpha",
  description: "Main project board for the Trello Clone development",
  background: "#1e40af",
  labels,
  members: [
    { user: users[0], role: "OWNER" },
    { user: users[1], role: "ADMIN" },
    { user: users[2], role: "MEMBER" },
  ],
  lists: [
    { id: "list-1", title: "Backlog", position: 1000, boardId: "board-1", cards: backlogCards },
    { id: "list-2", title: "To Do", position: 2000, boardId: "board-1", cards: todoCards },
    { id: "list-3", title: "In Progress", position: 3000, boardId: "board-1", cards: inProgressCards },
    { id: "list-4", title: "Review", position: 4000, boardId: "board-1", cards: reviewCards },
    { id: "list-5", title: "Done", position: 5000, boardId: "board-1", cards: doneCards },
  ],
};

export const dummyUser = users[0];

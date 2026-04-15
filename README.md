# Trello Clone - Production Architecture

A production-oriented Trello clone built with a monorepo architecture:

- `apps/web` - Next.js App Router frontend
- `apps/api` - Express + TypeScript backend
- `packages/database` - Prisma client and DB layer
- `packages/shared` - shared DTOs/constants/types

## Stack

- Frontend: Next.js, Tailwind CSS, TanStack Query, `@dnd-kit`
- Backend: Node.js, Express, TypeScript, Zod
- Database: PostgreSQL + Prisma
- Auth: JWT bearer tokens

## Architecture

### Backend Layers

The API follows a layered structure:

- Controllers: HTTP transport concerns and response shaping
- Services: business logic and permission checks
- Repositories: Prisma data access only

This keeps domain logic testable and prevents controller bloat.

### Decimal Positioning System

Lists and cards use decimal-style ordering values (`1000`, `2000`, etc.) instead of consecutive integers.

Benefits:

- Reorder operations update only the moved entity
- Cross-list card moves stay O(1) for write count
- Fewer transactional conflicts in collaborative boards

If gaps become too small, services trigger a rebalance job to normalize spacing.

## Phase Completion Snapshot

- Phase 1: schema + monorepo + position strategy
- Phase 2: typed CRUD APIs, validation, global error handling, activity logging
- Phase 3: Trello-style board UI with modular components and optimistic updates
- Phase 4: drag-and-drop for list/card reorder and cross-list moves, mutation sync
- Phase 5: JWT-protected frontend flow, local card filtering, activity drawer, cleanup

## Local Development

### 1) Install dependencies

```bash
pnpm install
```

### 2) Configure environment

Copy `.env.example` to `.env` and adjust values if needed.

### 3) Start PostgreSQL with Docker

```bash
docker-compose up -d
```

### 4) Run Prisma setup

```bash
pnpm --filter @trello-clone/database prisma:generate
pnpm --filter @trello-clone/database prisma:migrate
```

### 5) Start apps

In separate terminals:

```bash
pnpm --filter @trello-clone/api dev
pnpm --filter @trello-clone/web dev
```

Frontend: `http://localhost:3000`  
API: `http://localhost:4000/api`

## Authentication Notes

- Register/Login endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Frontend stores JWT in `localStorage` key: `trello_token`
- Protected API calls send `Authorization: Bearer <token>`

## Activity Log

- Board feed endpoint: `GET /api/activity/board/:boardId`
- Frontend renders this in a right-side activity drawer for auditing card/list actions.


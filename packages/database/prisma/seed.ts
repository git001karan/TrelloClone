import { PrismaClient, BoardRole } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();
const POSITION_GAP = 1000;

async function main() {
  console.log("🌱 Seeding database...\n");

  const passwordHash = await hash("password123", 12);

  // ─── Create Users ──────────────────────────────────
  const demo = await prisma.user.upsert({
    where: { email: "demo@trello-clone.dev" },
    update: {},
    create: { email: "demo@trello-clone.dev", name: "Demo User", passwordHash, avatarUrl: null },
  });

  const alex = await prisma.user.upsert({
    where: { email: "alex@trello-clone.dev" },
    update: {},
    create: { email: "alex@trello-clone.dev", name: "Alex Chen", passwordHash, avatarUrl: null },
  });

  const sarah = await prisma.user.upsert({
    where: { email: "sarah@trello-clone.dev" },
    update: {},
    create: { email: "sarah@trello-clone.dev", name: "Sarah Kim", passwordHash, avatarUrl: null },
  });

  const marcus = await prisma.user.upsert({
    where: { email: "marcus@trello-clone.dev" },
    update: {},
    create: { email: "marcus@trello-clone.dev", name: "Marcus Johnson", passwordHash, avatarUrl: null },
  });

  console.log(`✅ Users created: ${demo.name}, ${alex.name}, ${sarah.name}, ${marcus.name}`);

  // ─── Create Board ──────────────────────────────────
  const board = await prisma.board.upsert({
    where: { id: "board-seed-1" },
    update: {},
    create: {
      id: "board-seed-1",
      title: "Project Alpha",
      description: "Main project board for the Trello Clone development",
      background: "#1e40af",
      createdById: demo.id,
    },
  });
  console.log(`✅ Board created: ${board.title}`);

  // ─── Add All Members to Board ──────────────────────
  await Promise.all([
    prisma.boardMember.upsert({
      where: { userId_boardId: { userId: demo.id, boardId: board.id } },
      update: {},
      create: { userId: demo.id, boardId: board.id, role: BoardRole.OWNER },
    }),
    prisma.boardMember.upsert({
      where: { userId_boardId: { userId: alex.id, boardId: board.id } },
      update: {},
      create: { userId: alex.id, boardId: board.id, role: BoardRole.ADMIN },
    }),
    prisma.boardMember.upsert({
      where: { userId_boardId: { userId: sarah.id, boardId: board.id } },
      update: {},
      create: { userId: sarah.id, boardId: board.id, role: BoardRole.MEMBER },
    }),
    prisma.boardMember.upsert({
      where: { userId_boardId: { userId: marcus.id, boardId: board.id } },
      update: {},
      create: { userId: marcus.id, boardId: board.id, role: BoardRole.MEMBER },
    }),
  ]);
  console.log(`✅ Board members added`);

  // ─── Labels ────────────────────────────────────────
  const labelData = [
    { name: "Bug", color: "#ef4444" },
    { name: "Feature", color: "#3b82f6" },
    { name: "Enhancement", color: "#8b5cf6" },
    { name: "Urgent", color: "#f59e0b" },
    { name: "Documentation", color: "#10b981" },
    { name: "Design", color: "#ec4899" },
  ];

  const labels = await Promise.all(
    labelData.map((label) =>
      prisma.label.upsert({
        where: { id: `label-seed-${label.name.toLowerCase()}` },
        update: {},
        create: { id: `label-seed-${label.name.toLowerCase()}`, ...label, boardId: board.id },
      })
    )
  );
  console.log(`✅ Labels created: ${labels.length}`);

  // ─── Lists ─────────────────────────────────────────
  const listData = [
    { id: "list-seed-1", title: "Backlog", position: POSITION_GAP * 1 },
    { id: "list-seed-2", title: "To Do", position: POSITION_GAP * 2 },
    { id: "list-seed-3", title: "In Progress", position: POSITION_GAP * 3 },
    { id: "list-seed-4", title: "Review", position: POSITION_GAP * 4 },
    { id: "list-seed-5", title: "Done", position: POSITION_GAP * 5 },
  ];

  const lists = await Promise.all(
    listData.map((list) =>
      prisma.list.upsert({
        where: { id: list.id },
        update: {},
        create: { ...list, boardId: board.id },
      })
    )
  );
  console.log(`✅ Lists created: ${lists.map((l) => l.title).join(", ")}`);

  // ─── Cards ─────────────────────────────────────────
  const cardsData = [
    { id: "card-seed-1", title: "Research competitor features", listId: lists[0].id, position: POSITION_GAP * 1, description: "Analyze top 5 competitors and document their key features." },
    { id: "card-seed-2", title: "Define MVP scope document", listId: lists[0].id, position: POSITION_GAP * 2, description: "Create a comprehensive document outlining the minimum viable product features." },
    { id: "card-seed-3", title: "Write technical specification", listId: lists[0].id, position: POSITION_GAP * 3, description: null },
    { id: "card-seed-4", title: "Set up CI/CD pipeline", listId: lists[1].id, position: POSITION_GAP * 1, description: "Configure GitHub Actions for automated testing and deployment." },
    { id: "card-seed-5", title: "Design database schema", listId: lists[1].id, position: POSITION_GAP * 2, description: "Design and implement PostgreSQL schema with Prisma ORM." },
    { id: "card-seed-6", title: "Create API documentation", listId: lists[1].id, position: POSITION_GAP * 3, description: null },
    { id: "card-seed-7", title: "Build authentication system", listId: lists[2].id, position: POSITION_GAP * 1, description: "JWT-based auth with bcrypt password hashing, registration, login, and token refresh." },
    { id: "card-seed-8", title: "Implement drag-and-drop", listId: lists[2].id, position: POSITION_GAP * 2, description: "Use @dnd-kit for card reordering within and across lists with optimistic UI updates." },
    { id: "card-seed-9", title: "Board CRUD operations", listId: lists[3].id, position: POSITION_GAP * 1, description: "Create, read, update, delete operations for boards with proper access control." },
    { id: "card-seed-10", title: "Project setup & monorepo config", listId: lists[4].id, position: POSITION_GAP * 1, description: "pnpm workspaces, TypeScript configs, Prisma schema, Express server scaffold." },
    { id: "card-seed-11", title: "Set up development environment", listId: lists[4].id, position: POSITION_GAP * 2, description: "Docker Compose for PostgreSQL, environment variables, and developer documentation." },
  ];

  const cards = await Promise.all(
    cardsData.map((card) =>
      prisma.card.upsert({
        where: { id: card.id },
        update: {},
        create: card,
      })
    )
  );
  console.log(`✅ Cards created: ${cards.length}`);

  // ─── Card Labels ───────────────────────────────────
  const cardLabelData = [
    { cardId: cards[0].id, labelId: labels[1].id },
    { cardId: cards[1].id, labelId: labels[4].id },
    { cardId: cards[3].id, labelId: labels[1].id },
    { cardId: cards[4].id, labelId: labels[1].id },
    { cardId: cards[6].id, labelId: labels[2].id },
    { cardId: cards[6].id, labelId: labels[3].id },
    { cardId: cards[7].id, labelId: labels[1].id },
    { cardId: cards[7].id, labelId: labels[5].id },
    { cardId: cards[8].id, labelId: labels[2].id },
    { cardId: cards[9].id, labelId: labels[2].id },
  ];

  for (const cl of cardLabelData) {
    await prisma.cardLabel.upsert({
      where: { cardId_labelId: cl },
      update: {},
      create: cl,
    });
  }
  console.log(`✅ Card labels assigned`);

  // ─── Card Assignees ────────────────────────────────
  const assigneeData = [
    { cardId: cards[0].id, userId: alex.id },
    { cardId: cards[1].id, userId: demo.id },
    { cardId: cards[1].id, userId: sarah.id },
    { cardId: cards[3].id, userId: marcus.id },
    { cardId: cards[4].id, userId: alex.id },
    { cardId: cards[6].id, userId: demo.id },
    { cardId: cards[6].id, userId: marcus.id },
    { cardId: cards[7].id, userId: sarah.id },
    { cardId: cards[8].id, userId: alex.id },
    { cardId: cards[9].id, userId: demo.id },
    { cardId: cards[9].id, userId: alex.id },
    { cardId: cards[9].id, userId: sarah.id },
    { cardId: cards[10].id, userId: marcus.id },
  ];

  for (const a of assigneeData) {
    await prisma.cardAssignee.upsert({
      where: { cardId_userId: a },
      update: {},
      create: a,
    });
  }
  console.log(`✅ Card assignees set`);

  // ─── Activity Logs ─────────────────────────────────
  await prisma.activityLog.createMany({
    skipDuplicates: true,
    data: [
      { action: "CARD_CREATED", entityType: "Card", entityId: cards[9].id, userId: demo.id, cardId: cards[9].id, metadata: { title: cards[9].title } },
      { action: "LIST_CREATED", entityType: "List", entityId: lists[0].id, userId: demo.id, metadata: { title: lists[0].title } },
      { action: "MEMBER_ADDED", entityType: "Board", entityId: board.id, userId: demo.id, metadata: { name: alex.name } },
      { action: "MEMBER_ADDED", entityType: "Board", entityId: board.id, userId: demo.id, metadata: { name: sarah.name } },
    ],
  });
  console.log(`✅ Activity logs created`);

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Demo credentials:");
  console.log("   Email:    demo@trello-clone.dev");
  console.log("   Password: password123");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

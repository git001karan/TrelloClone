import { PrismaClient, BoardRole } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

const POSITION_GAP = 1000;

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Create Demo User ──────────────────────────────
  const passwordHash = await hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@trello-clone.dev" },
    update: {},
    create: {
      email: "demo@trello-clone.dev",
      name: "Demo User",
      passwordHash,
      avatarUrl: null,
    },
  });
  console.log(`✅ User created: ${user.name} (${user.email})`);

  // ─── Create Demo Board ─────────────────────────────
  const board = await prisma.board.create({
    data: {
      title: "Project Alpha",
      description: "Main project board for the Trello Clone development",
      background: "#1e40af",
      createdById: user.id,
      members: {
        create: {
          userId: user.id,
          role: BoardRole.OWNER,
        },
      },
    },
  });
  console.log(`✅ Board created: ${board.title}`);

  // ─── Create Default Labels ─────────────────────────
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
      prisma.label.create({
        data: { ...label, boardId: board.id },
      })
    )
  );
  console.log(`✅ Labels created: ${labels.length} labels`);

  // ─── Create Lists with Decimal Positioning ─────────
  const listData = [
    { title: "Backlog", position: POSITION_GAP * 1 },
    { title: "To Do", position: POSITION_GAP * 2 },
    { title: "In Progress", position: POSITION_GAP * 3 },
    { title: "Review", position: POSITION_GAP * 4 },
    { title: "Done", position: POSITION_GAP * 5 },
  ];

  const lists = await Promise.all(
    listData.map((list) =>
      prisma.list.create({
        data: { ...list, boardId: board.id },
      })
    )
  );
  console.log(`✅ Lists created: ${lists.map((l) => l.title).join(", ")}`);

  // ─── Create Cards with Decimal Positioning ─────────
  const cardsData = [
    // Backlog
    { title: "Research competitor features", listId: lists[0].id, position: POSITION_GAP * 1 },
    { title: "Define MVP scope", listId: lists[0].id, position: POSITION_GAP * 2 },
    { title: "Write technical spec", listId: lists[0].id, position: POSITION_GAP * 3 },

    // To Do
    { title: "Set up CI/CD pipeline", listId: lists[1].id, position: POSITION_GAP * 1 },
    { title: "Design database schema", listId: lists[1].id, position: POSITION_GAP * 2, description: "Design and implement PostgreSQL schema with Prisma ORM" },

    // In Progress
    { title: "Build authentication system", listId: lists[2].id, position: POSITION_GAP * 1, description: "JWT-based auth with bcrypt password hashing" },
    { title: "Implement drag-and-drop", listId: lists[2].id, position: POSITION_GAP * 2 },

    // Review
    { title: "Board CRUD operations", listId: lists[3].id, position: POSITION_GAP * 1 },

    // Done
    { title: "Project setup & monorepo config", listId: lists[4].id, position: POSITION_GAP * 1 },
  ];

  const cards = await Promise.all(
    cardsData.map((card) =>
      prisma.card.create({
        data: card,
      })
    )
  );
  console.log(`✅ Cards created: ${cards.length} cards across ${lists.length} lists`);

  // ─── Assign Labels to Some Cards ───────────────────
  await prisma.cardLabel.createMany({
    data: [
      { cardId: cards[0].id, labelId: labels[1].id }, // Research → Feature
      { cardId: cards[3].id, labelId: labels[1].id }, // CI/CD → Feature
      { cardId: cards[5].id, labelId: labels[2].id }, // Auth → Enhancement
      { cardId: cards[6].id, labelId: labels[1].id }, // DnD → Feature
      { cardId: cards[7].id, labelId: labels[4].id }, // Board CRUD → Documentation
    ],
  });
  console.log(`✅ Card labels assigned`);

  // ─── Create Activity Logs ──────────────────────────
  await prisma.activityLog.createMany({
    data: [
      {
        action: "CARD_CREATED",
        entityType: "Card",
        entityId: cards[8].id,
        userId: user.id,
        cardId: cards[8].id,
        metadata: { title: cards[8].title },
      },
      {
        action: "LIST_CREATED",
        entityType: "List",
        entityId: lists[0].id,
        userId: user.id,
        metadata: { title: lists[0].title },
      },
    ],
  });
  console.log(`✅ Activity logs created`);

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

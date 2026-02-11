import { PrismaClient, Priority } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create sample labels
  const labelWork = await prisma.label.create({
    data: { name: "work", color: "#ff6b6b", order: 0 },
  });

  const labelPersonal = await prisma.label.create({
    data: { name: "personal", color: "#4ecdc4", order: 1 },
  });

  const labelUrgent = await prisma.label.create({
    data: { name: "urgent", color: "#ffd93d", order: 2 },
  });

  // Create sample projects
  const projectWork = await prisma.project.create({
    data: {
      name: "Work",
      color: "#3b82f6",
      order: 0,
      sections: {
        create: [
          { name: "To Do", order: 0 },
          { name: "In Progress", order: 1 },
          { name: "Done", order: 2 },
        ],
      },
    },
    include: { sections: true },
  });

  const projectPersonal = await prisma.project.create({
    data: {
      name: "Personal",
      color: "#10b981",
      order: 1,
    },
  });

  const projectShopping = await prisma.project.create({
    data: {
      name: "Shopping List",
      color: "#f59e0b",
      order: 2,
    },
  });

  // Create sample tasks
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Inbox tasks (no project)
  await prisma.task.create({
    data: {
      content: "Review quarterly goals",
      priority: Priority.P2,
      dueDate: today,
      order: 0,
      labels: { create: [{ labelId: labelWork.id }] },
    },
  });

  await prisma.task.create({
    data: {
      content: "Schedule dentist appointment",
      priority: Priority.P3,
      dueDate: tomorrow,
      order: 1,
      labels: { create: [{ labelId: labelPersonal.id }] },
    },
  });

  // Work project tasks
  await prisma.task.create({
    data: {
      content: "Prepare presentation for Monday",
      description: "Include Q4 metrics and projections",
      priority: Priority.P1,
      dueDate: tomorrow,
      projectId: projectWork.id,
      sectionId: projectWork.sections[0].id,
      order: 0,
      labels: {
        create: [{ labelId: labelWork.id }, { labelId: labelUrgent.id }],
      },
    },
  });

  await prisma.task.create({
    data: {
      content: "Code review for PR #42",
      priority: Priority.P2,
      projectId: projectWork.id,
      sectionId: projectWork.sections[1].id,
      order: 0,
      labels: { create: [{ labelId: labelWork.id }] },
    },
  });

  // Personal project tasks
  await prisma.task.create({
    data: {
      content: "Plan weekend trip",
      priority: Priority.P4,
      dueDate: nextWeek,
      projectId: projectPersonal.id,
      order: 0,
      labels: { create: [{ labelId: labelPersonal.id }] },
    },
  });

  // Shopping list tasks
  await prisma.task.create({
    data: {
      content: "Buy groceries",
      description: "Milk, eggs, bread, vegetables",
      priority: Priority.P3,
      projectId: projectShopping.id,
      order: 0,
    },
  });

  await prisma.task.create({
    data: {
      content: "Get new running shoes",
      priority: Priority.P4,
      projectId: projectShopping.id,
      order: 1,
    },
  });

  // Completed task example
  await prisma.task.create({
    data: {
      content: "Set up project repository",
      priority: Priority.P2,
      isCompleted: true,
      completedAt: new Date(),
      projectId: projectWork.id,
      sectionId: projectWork.sections[2].id,
      order: 0,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

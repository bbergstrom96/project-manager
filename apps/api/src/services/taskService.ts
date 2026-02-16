import { prisma } from "../lib/prisma";
import { NotFoundError } from "../lib/errors";
import type { CreateTaskSchema, UpdateTaskSchema } from "@proj-mgmt/shared";
import { startOfDay, endOfDay, addDays } from "date-fns";

const taskInclude = {
  labels: {
    include: {
      label: true,
    },
  },
  project: true,
  section: true,
  area: true,
  subtasks: {
    include: {
      labels: {
        include: {
          label: true,
        },
      },
    },
    orderBy: { order: "asc" as const },
  },
};

export class TaskService {
  async findAll(filters: {
    projectId?: string;
    sectionId?: string;
    areaId?: string;
    labelId?: string;
    priority?: string;
    dueDate?: "today" | "upcoming" | "overdue";
    completed?: boolean;
  }) {
    const where: any = {};

    // Default: show incomplete tasks
    where.isCompleted = filters.completed ?? false;

    // Only show top-level tasks (subtasks are nested under parents)
    where.parentId = null;

    if (filters.projectId) {
      where.projectId = filters.projectId === "inbox" ? null : filters.projectId;
    }

    if (filters.sectionId) {
      where.sectionId = filters.sectionId;
    }

    if (filters.areaId) {
      where.areaId = filters.areaId;
    }

    if (filters.labelId) {
      where.labels = {
        some: { labelId: filters.labelId },
      };
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.dueDate) {
      const today = startOfDay(new Date());
      const tomorrow = startOfDay(addDays(new Date(), 1));
      const nextWeek = startOfDay(addDays(new Date(), 7));

      switch (filters.dueDate) {
        case "today":
          where.dueDate = {
            gte: today,
            lt: tomorrow,
          };
          break;
        case "upcoming":
          where.dueDate = {
            gte: today,
            lt: nextWeek,
          };
          break;
        case "overdue":
          where.dueDate = {
            lt: today,
          };
          break;
      }
    }

    return prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
  }

  async findById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: taskInclude,
    });

    if (!task) {
      throw new NotFoundError("Task");
    }

    return task;
  }

  async create(data: CreateTaskSchema) {
    const { labelIds, ...taskData } = data;

    // Get the next order value
    const maxOrder = await prisma.task.aggregate({
      _max: { order: true },
      where: { projectId: taskData.projectId ?? null },
    });

    return prisma.task.create({
      data: {
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        dueDateTime: taskData.dueDateTime
          ? new Date(taskData.dueDateTime)
          : null,
        order: (maxOrder._max.order ?? -1) + 1,
        labels: labelIds
          ? {
              create: labelIds.map((labelId) => ({ labelId })),
            }
          : undefined,
      },
      include: taskInclude,
    });
  }

  async update(id: string, data: UpdateTaskSchema) {
    const { labelIds, ...taskData } = data;

    // First, verify task exists
    await this.findById(id);

    // Handle label updates
    if (labelIds !== undefined) {
      // Delete existing labels and add new ones
      await prisma.taskLabel.deleteMany({ where: { taskId: id } });
      if (labelIds.length > 0) {
        await prisma.taskLabel.createMany({
          data: labelIds.map((labelId) => ({ taskId: id, labelId })),
        });
      }
    }

    return prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        dueDate:
          taskData.dueDate === null
            ? null
            : taskData.dueDate
            ? new Date(taskData.dueDate)
            : undefined,
        dueDateTime:
          taskData.dueDateTime === null
            ? null
            : taskData.dueDateTime
            ? new Date(taskData.dueDateTime)
            : undefined,
      },
      include: taskInclude,
    });
  }

  async complete(id: string) {
    await this.findById(id);

    return prisma.task.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
      include: taskInclude,
    });
  }

  async reopen(id: string) {
    await this.findById(id);

    return prisma.task.update({
      where: { id },
      data: {
        isCompleted: false,
        completedAt: null,
      },
      include: taskInclude,
    });
  }

  async delete(id: string) {
    await this.findById(id);

    return prisma.task.delete({
      where: { id },
    });
  }

  async reorder(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      prisma.task.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);
  }
}

export const taskService = new TaskService();

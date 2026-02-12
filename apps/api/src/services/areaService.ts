import { prisma } from "../lib/prisma";
import { NotFoundError } from "../lib/errors";
import type { CreateAreaInput, UpdateAreaInput, UpdateAreaGoalInput } from "@proj-mgmt/shared";

export class AreaService {
  async findAll() {
    return prisma.area.findMany({
      orderBy: { order: "asc" },
      include: {
        projects: {
          where: { isArchived: false },
          orderBy: { order: "asc" },
        },
      },
    });
  }

  async findById(id: string) {
    const area = await prisma.area.findUnique({
      where: { id },
      include: {
        goals: true,
        projects: {
          where: { isArchived: false },
          orderBy: { order: "asc" },
        },
        tasks: {
          where: { isCompleted: false },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          include: {
            labels: {
              include: {
                label: true,
              },
            },
            project: true,
            section: true,
          },
        },
      },
    });

    if (!area) {
      throw new NotFoundError("Area");
    }

    return area;
  }

  async create(data: CreateAreaInput) {
    const maxOrder = await prisma.area.aggregate({
      _max: { order: true },
    });

    return prisma.area.create({
      data: {
        ...data,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
  }

  async update(id: string, data: UpdateAreaInput) {
    const area = await prisma.area.findUnique({ where: { id } });
    if (!area) {
      throw new NotFoundError("Area");
    }

    return prisma.area.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const area = await prisma.area.findUnique({ where: { id } });
    if (!area) {
      throw new NotFoundError("Area");
    }

    return prisma.area.delete({
      where: { id },
    });
  }

  async reorder(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      prisma.area.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);
  }

  // Goal methods
  async findGoalsByPeriod(period: string) {
    return prisma.areaGoal.findMany({
      where: { period },
      include: { area: true },
    });
  }

  async findGoalsByAreaAndPeriods(areaId: string, periods: string[]) {
    return prisma.areaGoal.findMany({
      where: {
        areaId,
        period: { in: periods },
      },
    });
  }

  async upsertGoal(areaId: string, period: string, data: UpdateAreaGoalInput) {
    const area = await prisma.area.findUnique({ where: { id: areaId } });
    if (!area) {
      throw new NotFoundError("Area");
    }

    return prisma.areaGoal.upsert({
      where: {
        areaId_period: { areaId, period },
      },
      create: {
        areaId,
        period,
        content: data.content,
      },
      update: {
        content: data.content,
      },
    });
  }

  async getGoalsForPeriods(periods: string[]) {
    const goals = await prisma.areaGoal.findMany({
      where: {
        period: { in: periods },
      },
    });

    // Group by areaId and period
    const goalMap: Record<string, Record<string, string>> = {};
    goals.forEach((goal) => {
      if (!goalMap[goal.areaId]) {
        goalMap[goal.areaId] = {};
      }
      goalMap[goal.areaId][goal.period] = goal.content;
    });

    return goalMap;
  }
}

export const areaService = new AreaService();

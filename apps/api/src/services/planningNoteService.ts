import { prisma } from "../lib/prisma";
import { NotFoundError } from "../lib/errors";
import type { CreatePlanningNoteInput, UpdatePlanningNoteInput } from "@proj-mgmt/shared";

export class PlanningNoteService {
  async findByQuarter(quarter: string) {
    return prisma.planningNote.findMany({
      where: { quarter },
      orderBy: { order: "asc" },
    });
  }

  async findById(id: string) {
    const note = await prisma.planningNote.findUnique({
      where: { id },
    });

    if (!note) {
      throw new NotFoundError("PlanningNote");
    }

    return note;
  }

  async create(data: CreatePlanningNoteInput) {
    const maxOrder = await prisma.planningNote.aggregate({
      where: { quarter: data.quarter },
      _max: { order: true },
    });

    return prisma.planningNote.create({
      data: {
        title: data.title ?? "New Note",
        content: data.content ?? "",
        quarter: data.quarter,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
  }

  async update(id: string, data: UpdatePlanningNoteInput) {
    const note = await prisma.planningNote.findUnique({ where: { id } });
    if (!note) {
      throw new NotFoundError("PlanningNote");
    }

    return prisma.planningNote.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const note = await prisma.planningNote.findUnique({ where: { id } });
    if (!note) {
      throw new NotFoundError("PlanningNote");
    }

    return prisma.planningNote.delete({
      where: { id },
    });
  }

  async reorder(quarter: string, orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      prisma.planningNote.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);
  }
}

export const planningNoteService = new PlanningNoteService();

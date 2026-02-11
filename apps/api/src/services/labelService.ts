import { prisma } from "../lib/prisma";
import { NotFoundError } from "../lib/errors";
import type { CreateLabelSchema, UpdateLabelSchema } from "@proj-mgmt/shared";

export class LabelService {
  async findAll() {
    return prisma.label.findMany({
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: [{ isFavorite: "desc" }, { order: "asc" }],
    });
  }

  async findById(id: string) {
    const label = await prisma.label.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            task: {
              include: {
                labels: {
                  include: { label: true },
                },
                project: true,
              },
            },
          },
        },
      },
    });

    if (!label) {
      throw new NotFoundError("Label");
    }

    return label;
  }

  async create(data: CreateLabelSchema) {
    const maxOrder = await prisma.label.aggregate({
      _max: { order: true },
    });

    return prisma.label.create({
      data: {
        ...data,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
  }

  async update(id: string, data: UpdateLabelSchema) {
    const label = await prisma.label.findUnique({ where: { id } });
    if (!label) {
      throw new NotFoundError("Label");
    }

    return prisma.label.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const label = await prisma.label.findUnique({ where: { id } });
    if (!label) {
      throw new NotFoundError("Label");
    }

    return prisma.label.delete({
      where: { id },
    });
  }

  async reorder(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      prisma.label.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);
  }
}

export const labelService = new LabelService();

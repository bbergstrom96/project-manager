import { prisma } from "../lib/prisma";
import { NotFoundError } from "../lib/errors";
import { getCurrentRoutineDate } from "../lib/routineDate";
import type {
  CreateRoutineSchema,
  UpdateRoutineSchema,
  CreateRoutineSectionSchema,
  UpdateRoutineSectionSchema,
  CreateRoutineItemSchema,
  UpdateRoutineItemSchema,
  RoutineWithSections,
  RoutineSectionWithItems,
  RoutineItemWithCompletion,
} from "@proj-mgmt/shared";

export class RoutineService {
  /**
   * Transform raw DB items into items with completion status
   */
  private transformItems(
    items: Array<{
      id: string;
      name: string;
      description: string | null;
      order: number;
      isTrackable: boolean;
      sectionId: string;
      parentId: string | null;
      createdAt: Date;
      updatedAt: Date;
      completions: Array<{ routineDate: string }>;
      subItems?: Array<{
        id: string;
        name: string;
        description: string | null;
        order: number;
        isTrackable: boolean;
        sectionId: string;
        parentId: string | null;
        createdAt: Date;
        updatedAt: Date;
        completions: Array<{ routineDate: string }>;
      }>;
    }>,
    routineDate: string
  ): RoutineItemWithCompletion[] {
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      order: item.order,
      isTrackable: item.isTrackable,
      sectionId: item.sectionId,
      parentId: item.parentId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      isCompleted: item.completions.some((c) => c.routineDate === routineDate),
      subItems: item.subItems
        ? this.transformItems(item.subItems as typeof items, routineDate)
        : undefined,
    }));
  }

  async findAll(includeArchived = false): Promise<RoutineWithSections[]> {
    const routineDate = getCurrentRoutineDate();

    const routines = await prisma.routine.findMany({
      where: includeArchived ? {} : { isArchived: false },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            items: {
              where: { parentId: null }, // Only top-level items
              orderBy: { order: "asc" },
              include: {
                completions: {
                  where: { routineDate },
                  select: { routineDate: true },
                },
                subItems: {
                  orderBy: { order: "asc" },
                  include: {
                    completions: {
                      where: { routineDate },
                      select: { routineDate: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    // Transform to include isCompleted
    return routines.map((routine) => ({
      ...routine,
      sections: routine.sections.map((section) => ({
        ...section,
        items: this.transformItems(section.items as Parameters<typeof this.transformItems>[0], routineDate),
      })),
    }));
  }

  async findById(id: string): Promise<RoutineWithSections> {
    const routineDate = getCurrentRoutineDate();

    const routine = await prisma.routine.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            items: {
              where: { parentId: null },
              orderBy: { order: "asc" },
              include: {
                completions: {
                  where: { routineDate },
                  select: { routineDate: true },
                },
                subItems: {
                  orderBy: { order: "asc" },
                  include: {
                    completions: {
                      where: { routineDate },
                      select: { routineDate: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!routine) {
      throw new NotFoundError("Routine");
    }

    return {
      ...routine,
      sections: routine.sections.map((section) => ({
        ...section,
        items: this.transformItems(section.items as Parameters<typeof this.transformItems>[0], routineDate),
      })),
    };
  }

  async create(data: CreateRoutineSchema) {
    const maxOrder = await prisma.routine.aggregate({
      _max: { order: true },
    });

    return prisma.routine.create({
      data: {
        ...data,
        order: (maxOrder._max.order ?? -1) + 1,
      },
      include: {
        sections: true,
      },
    });
  }

  async update(id: string, data: UpdateRoutineSchema) {
    const routine = await prisma.routine.findUnique({ where: { id } });
    if (!routine) {
      throw new NotFoundError("Routine");
    }

    return prisma.routine.update({
      where: { id },
      data,
      include: {
        sections: true,
      },
    });
  }

  async delete(id: string) {
    const routine = await prisma.routine.findUnique({ where: { id } });
    if (!routine) {
      throw new NotFoundError("Routine");
    }

    return prisma.routine.delete({
      where: { id },
    });
  }

  async reorder(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      prisma.routine.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);
  }

  // Section methods
  async createSection(routineId: string, data: CreateRoutineSectionSchema) {
    const routine = await prisma.routine.findUnique({ where: { id: routineId } });
    if (!routine) {
      throw new NotFoundError("Routine");
    }

    const maxOrder = await prisma.routineSection.aggregate({
      _max: { order: true },
      where: { routineId },
    });

    return prisma.routineSection.create({
      data: {
        name: data.name,
        routineId,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
  }

  async updateSection(id: string, data: UpdateRoutineSectionSchema) {
    const section = await prisma.routineSection.findUnique({ where: { id } });
    if (!section) {
      throw new NotFoundError("RoutineSection");
    }

    return prisma.routineSection.update({
      where: { id },
      data,
    });
  }

  async deleteSection(id: string) {
    const section = await prisma.routineSection.findUnique({ where: { id } });
    if (!section) {
      throw new NotFoundError("RoutineSection");
    }

    return prisma.routineSection.delete({
      where: { id },
    });
  }

  async reorderSections(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      prisma.routineSection.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);
  }

  // Item methods
  async createItem(sectionId: string, data: CreateRoutineItemSchema) {
    const section = await prisma.routineSection.findUnique({ where: { id: sectionId } });
    if (!section) {
      throw new NotFoundError("RoutineSection");
    }

    // If parentId is provided, validate it exists and is in the same section
    if (data.parentId) {
      const parent = await prisma.routineItem.findUnique({ where: { id: data.parentId } });
      if (!parent) {
        throw new NotFoundError("Parent RoutineItem");
      }
      if (parent.sectionId !== sectionId) {
        throw new Error("Parent item must be in the same section");
      }
      if (parent.parentId) {
        throw new Error("Cannot create sub-items more than one level deep");
      }
    }

    const maxOrder = await prisma.routineItem.aggregate({
      _max: { order: true },
      where: { sectionId, parentId: data.parentId || null },
    });

    return prisma.routineItem.create({
      data: {
        name: data.name,
        description: data.description,
        isTrackable: data.isTrackable ?? false,
        sectionId,
        parentId: data.parentId,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
  }

  async updateItem(id: string, data: UpdateRoutineItemSchema) {
    const item = await prisma.routineItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundError("RoutineItem");
    }

    // If moving to a different section, validate it exists
    if (data.sectionId && data.sectionId !== item.sectionId) {
      const section = await prisma.routineSection.findUnique({ where: { id: data.sectionId } });
      if (!section) {
        throw new NotFoundError("RoutineSection");
      }
    }

    return prisma.routineItem.update({
      where: { id },
      data,
    });
  }

  async deleteItem(id: string) {
    const item = await prisma.routineItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundError("RoutineItem");
    }

    return prisma.routineItem.delete({
      where: { id },
    });
  }

  async reorderItems(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      prisma.routineItem.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);
  }

  // Completion methods
  async completeItem(itemId: string) {
    const item = await prisma.routineItem.findUnique({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundError("RoutineItem");
    }

    const routineDate = getCurrentRoutineDate();

    return prisma.routineItemCompletion.upsert({
      where: {
        itemId_routineDate: { itemId, routineDate },
      },
      create: {
        itemId,
        routineDate,
      },
      update: {}, // No update needed, just ensure it exists
    });
  }

  async uncompleteItem(itemId: string) {
    const item = await prisma.routineItem.findUnique({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundError("RoutineItem");
    }

    const routineDate = getCurrentRoutineDate();

    return prisma.routineItemCompletion.deleteMany({
      where: { itemId, routineDate },
    });
  }
}

export const routineService = new RoutineService();

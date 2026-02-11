import { prisma } from "../lib/prisma";
import { NotFoundError } from "../lib/errors";
import type {
  CreateProjectSchema,
  UpdateProjectSchema,
  CreateSectionSchema,
  UpdateSectionSchema,
} from "@proj-mgmt/shared";

export class ProjectService {
  async findAll(includeArchived = false) {
    return prisma.project.findMany({
      where: includeArchived ? {} : { isArchived: false },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            tasks: {
              where: { isCompleted: false },
            },
          },
        },
      },
      orderBy: [{ isFavorite: "desc" }, { order: "asc" }],
    });
  }

  async findById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
        tasks: {
          where: { isCompleted: false },
          include: {
            labels: {
              include: { label: true },
            },
          },
          orderBy: [{ order: "asc" }],
        },
      },
    });

    if (!project) {
      throw new NotFoundError("Project");
    }

    return project;
  }

  async create(data: CreateProjectSchema) {
    const maxOrder = await prisma.project.aggregate({
      _max: { order: true },
    });

    return prisma.project.create({
      data: {
        ...data,
        order: (maxOrder._max.order ?? -1) + 1,
      },
      include: {
        sections: true,
      },
    });
  }

  async update(id: string, data: UpdateProjectSchema) {
    await this.findById(id);

    return prisma.project.update({
      where: { id },
      data,
      include: {
        sections: true,
      },
    });
  }

  async archive(id: string) {
    await this.findById(id);

    return prisma.project.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async unarchive(id: string) {
    await this.findById(id);

    return prisma.project.update({
      where: { id },
      data: { isArchived: false },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    return prisma.project.delete({
      where: { id },
    });
  }

  async reorder(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      prisma.project.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);
  }

  // Section methods
  async createSection(projectId: string, data: CreateSectionSchema) {
    await this.findById(projectId);

    const maxOrder = await prisma.section.aggregate({
      _max: { order: true },
      where: { projectId },
    });

    return prisma.section.create({
      data: {
        name: data.name,
        projectId,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
  }

  async updateSection(id: string, data: UpdateSectionSchema) {
    const section = await prisma.section.findUnique({ where: { id } });
    if (!section) {
      throw new NotFoundError("Section");
    }

    return prisma.section.update({
      where: { id },
      data,
    });
  }

  async deleteSection(id: string) {
    const section = await prisma.section.findUnique({ where: { id } });
    if (!section) {
      throw new NotFoundError("Section");
    }

    return prisma.section.delete({
      where: { id },
    });
  }

  async reorderSections(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      prisma.section.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);
  }
}

export const projectService = new ProjectService();

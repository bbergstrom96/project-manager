import { Request, Response, NextFunction } from "express";
import { projectService } from "../services/projectService";

export const projectController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const includeArchived = req.query.include_archived === "true";
      const projects = await projectService.findAll(includeArchived);
      res.json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.findById(req.params.id);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.create(req.body);
      res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.update(req.params.id, req.body);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },

  async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.archive(req.params.id);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },

  async unarchive(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.unarchive(req.params.id);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await projectService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      await projectService.reorder(req.body.orderedIds);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  },

  // Section handlers
  async getSections(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.findById(req.params.projectId);
      res.json({ success: true, data: project.sections });
    } catch (error) {
      next(error);
    }
  },

  async createSection(req: Request, res: Response, next: NextFunction) {
    try {
      const section = await projectService.createSection(
        req.params.projectId,
        req.body
      );
      res.status(201).json({ success: true, data: section });
    } catch (error) {
      next(error);
    }
  },

  async updateSection(req: Request, res: Response, next: NextFunction) {
    try {
      const section = await projectService.updateSection(
        req.params.id,
        req.body
      );
      res.json({ success: true, data: section });
    } catch (error) {
      next(error);
    }
  },

  async deleteSection(req: Request, res: Response, next: NextFunction) {
    try {
      await projectService.deleteSection(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async reorderSections(req: Request, res: Response, next: NextFunction) {
    try {
      await projectService.reorderSections(req.body.orderedIds);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  },
};

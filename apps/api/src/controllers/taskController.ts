import { Request, Response, NextFunction } from "express";
import { taskService } from "../services/taskService";

export const taskController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        projectId: req.query.project_id as string | undefined,
        sectionId: req.query.section_id as string | undefined,
        areaId: req.query.area_id as string | undefined,
        labelId: req.query.label_id as string | undefined,
        priority: req.query.priority as string | undefined,
        dueDate: req.query.due_date as "today" | "upcoming" | "overdue" | undefined,
        completed: req.query.completed === "true",
      };

      const tasks = await taskService.findAll(filters);
      res.json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.findById(req.params.id);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.create(req.body);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.update(req.params.id, req.body);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  },

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.complete(req.params.id);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  },

  async reopen(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.reopen(req.params.id);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await taskService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      await taskService.reorder(req.body.orderedIds);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  },
};

import { Request, Response, NextFunction } from "express";
import { routineService } from "../services/routineService";

export const routineController = {
  // Routine handlers
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const includeArchived = req.query.include_archived === "true";
      const routines = await routineService.findAll(includeArchived);
      res.json({ success: true, data: routines });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const routine = await routineService.findById(req.params.id);
      res.json({ success: true, data: routine });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const routine = await routineService.create(req.body);
      res.status(201).json({ success: true, data: routine });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const routine = await routineService.update(req.params.id, req.body);
      res.json({ success: true, data: routine });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await routineService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      await routineService.reorder(req.body.orderedIds);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  },

  // Section handlers
  async createSection(req: Request, res: Response, next: NextFunction) {
    try {
      const section = await routineService.createSection(req.params.id, req.body);
      res.status(201).json({ success: true, data: section });
    } catch (error) {
      next(error);
    }
  },

  async updateSection(req: Request, res: Response, next: NextFunction) {
    try {
      const section = await routineService.updateSection(req.params.id, req.body);
      res.json({ success: true, data: section });
    } catch (error) {
      next(error);
    }
  },

  async deleteSection(req: Request, res: Response, next: NextFunction) {
    try {
      await routineService.deleteSection(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async reorderSections(req: Request, res: Response, next: NextFunction) {
    try {
      await routineService.reorderSections(req.body.orderedIds);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  },

  // Item handlers
  async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await routineService.createItem(req.params.id, req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await routineService.updateItem(req.params.id, req.body);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      await routineService.deleteItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async reorderItems(req: Request, res: Response, next: NextFunction) {
    try {
      await routineService.reorderItems(req.body.orderedIds);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  },

  // Completion handlers
  async completeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const completion = await routineService.completeItem(req.params.id);
      res.json({ success: true, data: completion });
    } catch (error) {
      next(error);
    }
  },

  async uncompleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      await routineService.uncompleteItem(req.params.id);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  },
};

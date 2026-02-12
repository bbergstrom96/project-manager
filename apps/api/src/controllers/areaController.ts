import { Request, Response, NextFunction } from "express";
import { areaService } from "../services/areaService";

export const areaController = {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const areas = await areaService.findAll();
      res.json({ success: true, data: areas });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const area = await areaService.findById(req.params.id);
      res.json({ success: true, data: area });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const area = await areaService.create(req.body);
      res.status(201).json({ success: true, data: area });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const area = await areaService.update(req.params.id, req.body);
      res.json({ success: true, data: area });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await areaService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      await areaService.reorder(req.body.orderedIds);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  },

  // Goal endpoints
  async upsertGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = await areaService.upsertGoal(
        req.params.id,
        req.params.period,
        req.body
      );
      res.json({ success: true, data: goal });
    } catch (error) {
      next(error);
    }
  },

  async getGoalsForPeriods(req: Request, res: Response, next: NextFunction) {
    try {
      const periods = (req.query.periods as string)?.split(",") || [];
      const goals = await areaService.getGoalsForPeriods(periods);
      res.json({ success: true, data: goals });
    } catch (error) {
      next(error);
    }
  },
};

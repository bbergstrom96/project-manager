import { Request, Response, NextFunction } from "express";
import { labelService } from "../services/labelService";

export const labelController = {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const labels = await labelService.findAll();
      res.json({ success: true, data: labels });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const label = await labelService.findById(req.params.id);
      res.json({ success: true, data: label });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const label = await labelService.create(req.body);
      res.status(201).json({ success: true, data: label });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const label = await labelService.update(req.params.id, req.body);
      res.json({ success: true, data: label });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await labelService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      await labelService.reorder(req.body.orderedIds);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  },
};

// controller จะรับ request จาก route
import { Request, Response } from "express";
import * as service from "../services/category_service";

// GET 
export const getCategories = async (
  req: Request,
  res: Response
) => {
  const data = await service.getCategories();
  res.json(data);
};

// POST
export const createCategory = async (
  req: Request,
  res: Response
) => {
  const data = await service.createCategory(
    req.body
  );

  res.json(data);
};

// DELETE
export const deleteCategory = async (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  const data = await service.deleteCategory(id);

  res.json(data);
};
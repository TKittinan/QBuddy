import { Request, Response } from "express";
import * as service from "../services/restaurant_service";

export const getRestaurants = async (
  req: Request,
  res: Response
) => {
  const data = await service.getRestaurants();
  res.json(data);
};

export const getRestaurantById = async (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  const data = await service.getRestaurantById(id);

  res.json(data);
};

export const createRestaurant = async (
  req: Request,
  res: Response
) => {
  const data = await service.createRestaurant(
    req.body
  );

  res.json(data);
};

export const updateRestaurant = async (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  const data = await service.updateRestaurant(
    id,
    req.body
  );

  res.json(data);
};

export const deleteRestaurant = async (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  const data = await service.deleteRestaurant(id);

  res.json(data);
};
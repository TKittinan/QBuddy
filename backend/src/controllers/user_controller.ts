import { Request, Response } from "express";
import * as userService from "../services/user_service";

export const getUsers = async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const user = await userService.getUserById(id);

  res.json(user);
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  await userService.deleteUser(id);

  res.json({ message: "deleted" });
};
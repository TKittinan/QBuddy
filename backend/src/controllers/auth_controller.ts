import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export const register = async (req: Request, res: Response) => {
  const { email, password, first_name , last_name } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      first_name,
      last_name,
    },
  });

  res.json(user);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) return res.status(404).json("not found");

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) return res.status(401).json("wrong");

  const token = jwt.sign(
    { userId: user.user_id },
    "secret"
  );

  res.json({ token });
};
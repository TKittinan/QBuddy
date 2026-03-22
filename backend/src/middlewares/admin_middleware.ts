import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth_middleware";
import { prisma } from "../lib/prisma";

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json("Not logged in");
    }

    const admin = await prisma.admin.findUnique({
      where: {
        user_id: req.userId,
      },
    });

    if (!admin) {
      return res.status(403).json("Not admin");
    }

    next();
  } catch (err) {
    return res.status(500).json("error");
  }
};
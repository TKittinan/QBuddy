import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth_middleware";
import { prisma } from "../lib/prisma";

export const staffMiddleware = async (
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
      return res.status(403).json("No permission");
    }

    // อนุญาตทั้ง staff และ admin
    if (admin.role !== "admin" && admin.role !== "staff") {
      return res.status(403).json("Not allowed");
    }

    next();
  } catch (err) {
    return res.status(500).json("error");
  }
};
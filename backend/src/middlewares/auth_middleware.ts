import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: number;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json("No token");
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "secret") as any;

    req.userId = decoded.userId;

    next();
  } catch {
    return res.status(401).json("Invalid token");
  }
};
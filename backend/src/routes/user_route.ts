import { Router } from "express";
import {
  getUsers,
  getUserById,
  deleteUser,
  createUser,
  updateUser,

} from "../controllers/user_controller";

import { authMiddleware } from "../middlewares/auth_middleware";
import { adminMiddleware } from "../middlewares/admin_middleware";

const router = Router();

router.post("/", authMiddleware, adminMiddleware, createUser);

router.put("/:id", authMiddleware, adminMiddleware, updateUser);

router.get("/", authMiddleware, adminMiddleware, getUsers);

router.get("/:id", authMiddleware, getUserById);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteUser
);

export default router;
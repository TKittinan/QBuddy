import { Router } from "express";
import {
  getUsers,
  getUserById,
  deleteUser,
} from "../controllers/user_controller";

const router = Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);

export default router;
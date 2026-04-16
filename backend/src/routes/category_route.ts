import { Router } from "express";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../controllers/category_controller";
import { authMiddleware } from "../middlewares/auth_middleware";
import { adminMiddleware } from "../middlewares/admin_middleware";

const router = Router();

// ทุกคนสามารถดูได้
router.get("/", getCategories);

// เพิ่มได้แค่ admin เท่านั้น
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createCategory
);

// ลบได้แค่ admin เท่านั้น
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteCategory
);

export default router;
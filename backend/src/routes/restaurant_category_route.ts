import { Router } from "express";
import {
  addCategoryToRestaurant,
  removeCategoryFromRestaurant,
  getCategoriesOfRestaurant,
} from "../controllers/restaurant_category_controller";
import { authMiddleware } from "../middlewares/auth_middleware";
import { adminMiddleware } from "../middlewares/admin_middleware";

const router = Router();

// เพิ่ม category ให้ร้าน
router.post("/", 
  authMiddleware,
  adminMiddleware,
  addCategoryToRestaurant);

// ลบ category ออกจากร้าน
router.delete("/", 
  authMiddleware,
  adminMiddleware,
  removeCategoryFromRestaurant);

// ดู category ของร้าน
router.get("/:restaurant_id", getCategoriesOfRestaurant);

export default router;
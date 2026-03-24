import { Router } from "express";
import {
  addCategoryToRestaurant,
  removeCategoryFromRestaurant,
  getCategoriesOfRestaurant,
} from "../controllers/restaurant_category_controller";

const router = Router();

// เพิ่ม category ให้ร้าน
router.post("/", addCategoryToRestaurant);

// ลบ category ออกจากร้าน
router.delete("/", removeCategoryFromRestaurant);

// ดู category ของร้าน
router.get("/:restaurant_id", getCategoriesOfRestaurant);

export default router;
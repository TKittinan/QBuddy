import { Router } from "express";

import {
  createPromotion,
  getPromotions,
  getPromotionByRestaurant,
  getActivePromotions,
  deletePromotion,
} from "../controllers/promotion_controller";

const router = Router();

// create
router.post("/", createPromotion);

// get all
router.get("/", getPromotions);

// active promotion
router.get("/active", getActivePromotions);

// by restaurant
router.get("/restaurant/:restaurant_id", getPromotionByRestaurant);

// delete
router.delete("/:id", deletePromotion);

export default router;
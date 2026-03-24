import { Router } from "express";

import {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "../controllers/restaurant_controller";

import { authMiddleware } from "../middlewares/auth_middleware";
import { adminMiddleware } from "../middlewares/admin_middleware";

const router = Router();

router.get("/", getRestaurants);

router.get("/:id", getRestaurantById);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createRestaurant
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateRestaurant
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteRestaurant
);

export default router;
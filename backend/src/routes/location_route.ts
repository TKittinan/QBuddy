import { Router } from "express";
import { updateLocation, getLatestLocation } from "../controllers/location_controller";

const router = Router();

// update location (frontend ยิงทุก 5-10 วิ)
router.post("/", updateLocation);

// get ล่าสุด
router.get("/:user_id", getLatestLocation);

export default router;
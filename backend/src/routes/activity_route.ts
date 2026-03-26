import { Router } from "express";

import {
  createActivity,
  joinActivity,
  leaveActivity,
  getActivities,
} from "../controllers/activity_controller";

const router = Router();

// create
router.post("/", createActivity);

// join
router.post("/join", joinActivity);

// leave
router.post("/leave", leaveActivity);

// get all
router.get("/", getActivities);

export default router;
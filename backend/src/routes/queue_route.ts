import { Router } from "express";

import {
  createQueue,
  joinQueue,
  leaveQueue,
  getQueue,
  nextQueue,
} from "../controllers/queue_controller";

const router = Router();

router.post("/", createQueue);

router.post("/join", joinQueue);

router.delete("/leave/:id", leaveQueue);

router.get("/:restaurant_id", getQueue);

router.post("/next", nextQueue);

export default router;
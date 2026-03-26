import { Router } from "express";

import {
  generateRecommendation,
  getRecommendation,
} from "../controllers/ai_controller";

const router = Router();

// generate AI
router.post("/generate", generateRecommendation);

// get result
router.get("/:user_id", getRecommendation);

export default router;
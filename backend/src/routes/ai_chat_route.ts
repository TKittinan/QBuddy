import { Router } from "express";
import { aiChat } from "../controllers/ai_chat_controller";

const router = Router();

router.post("/", aiChat);

export default router;
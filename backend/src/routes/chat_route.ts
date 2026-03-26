import { Router } from "express";

import {
  sendMessage,
  getMessages,
  getConversationByActivity,
} from "../controllers/chat_controller";

const router = Router();

// send message
router.post("/message", sendMessage);

// get messages
router.get("/message/:conversation_id", getMessages);

// get conversation by activity
router.get("/activity/:activity_id", getConversationByActivity);

export default router;
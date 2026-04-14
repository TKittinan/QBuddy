import { Request, Response } from "express";
import { chatWithAI } from "../services/ai_chat_service";


// รับข้อความจาก user แล้วส่งให้ AI
export const aiChat = async (req: Request, res: Response) => {
  try {
    const message = req.body.message;

    if (!message) {
      return res.status(400).json({ message: "message is required" });
    }

    const reply = await chatWithAI(message);

    res.json({
      reply,
    });
  } catch (error) {
    res.status(500).json({ message: "AI error" });
  }
};
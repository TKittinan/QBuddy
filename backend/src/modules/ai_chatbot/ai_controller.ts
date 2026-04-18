// src/modules/ai_chatbot/ai_controller.ts
import { Request, Response } from "express";
import { AIService } from "./ai_service";
import { PlaceService } from "../places/place_service"; //

const aiService = new AIService();
const placeService = new PlaceService();

export const askAI = async (req: Request, res: Response) => {
  const { message } = req.body;
  
  try {
    // 1. ดึงข้อมูลร้านค้าทั้งหมดที่มีใน DB
    const places = await placeService.findAll(); 

    // 2. กรองเฉพาะข้อมูลที่จำเป็นไปให้ AI (ประหยัด Token และป้องกัน AI มึน)
    const placesContext = places.map(p => 
      `- Store Name: ${p.name}, Category: ${p.type}, Info: ${p.description}`
    ).join("\n");

    // 3. ส่งคำถาม + รายชื่อร้านค้าในระบบไปให้ Gemini
    const reply = await aiService.generateResponse(message, placesContext);

    res.json({ reply });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
// src/modules/ai_chatbot/ai_controller.ts
import { Request, Response } from "express";
import { AIService } from "./ai_service";
import { PlaceService } from "../places/place_service";

const aiService = new AIService();
const placeService = new PlaceService();

export const askAI = async (req: Request, res: Response) => {
  const { message } = req.body;
  
  try {
    // 1. ดึงข้อมูลร้านค้าทั้งหมดที่มีใน DB
    const places = await placeService.findAll(); 

    // 2. หั่นเอาแค่ 15 ร้านแรกส่งไปให้ AI (ป้องกันโควต้า Token ล้นจนพังค่ะ!)
    const placesContext = places.slice(0, 15).map((p: any) => {
      const imageUrl = p.coverUrl || p.logoUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500';
      return `- Name: ${p.name}, Category: ${p.category}, Info: ${p.description}, Distance: 1.5 กม., Image: ${imageUrl}`;
    }).join("\n");

    // 3. ส่งคำถาม + รายชื่อร้านค้าไปให้ Gemini
    const aiResult = await aiService.generateResponse(message, placesContext);

    // 4. ส่ง Object JSON คืนให้ Mobile
    res.json(aiResult);
    
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    // ตอนนี้เราส่ง Array ว่างๆ กลับไปก่อน เพื่อไม่ให้แอป Mobile พังตอนโหลดหน้าแรกค่ะ
    // (ถ้าอนาคตต้าทำระบบบันทึกแชทลง Database ค่อยมาดึงข้อมูลตรงนี้ค่ะ)
    res.json([]);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
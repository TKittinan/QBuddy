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

    // 2. กรองข้อมูลไปให้ AI ต้องเพิ่ม Image และ Distance ด้วยเพื่อให้ AI นำไปปั้นเป็น PlaceCard ได้
    const placesContext = places.map((p: any) => 
      `- Name: ${p.name}, Category: ${p.type}, Info: ${p.description}, Distance: 1.5 กม., Image: ${p.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'}`
    ).join("\n");

    // 3. ส่งคำถาม + รายชื่อร้านค้าในระบบไปให้ Gemini คิดคำตอบ
    const aiResult = await aiService.generateResponse(message, placesContext);

    // 4. ส่ง Object JSON ที่แกะมาจาก Gemini คืนให้ Mobile โดยตรง
    // เพื่อให้ Redux ดึง action.payload.text และ action.payload.placeCard ไปใช้งานได้เลย
    res.json(aiResult);
    
  } catch (error: any) {
    // แก้ตรงนี้เป็น message เพื่อให้ Redux ฝั่งมือถือจับ Error ได้ตรงจุดค่ะ
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
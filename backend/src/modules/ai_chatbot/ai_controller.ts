import { Request, Response } from "express";
import { AIService } from "./ai_service";
import { PlaceService } from "../places/place_service";

const aiService = new AIService();
const placeService = new PlaceService();

export const askAI = async (req: Request, res: Response) => {
  const { message } = req.body;
  
  try {
    const places = await placeService.findAll(); 

    // จำกัดแค่ 10 ร้าน และตัด URL รูปภาพออกทั้งหมด ลดคำอธิบายให้เหลือแค่ 80 ตัวอักษร
    const placesContext = places.slice(0, 10).map((p: any) => {
      const shortDesc = p.description ? String(p.description).substring(0, 80) : "";
      return `- Name: ${p.name}, Category: ${p.category}, Info: ${shortDesc}, Distance: 1.5 กม.`;
    }).join("\n");

    const aiResult = await aiService.generateResponse(message, placesContext);

    // ประกอบ URL รูปภาพกลับเข้าไปให้ใน placeCard หลังจากที่ AI เลือกชื่อร้านมาให้แล้ว
    if (aiResult.placeCard && aiResult.placeCard.name) {
      const matchedPlace = places.find((p: any) => p.name === aiResult.placeCard.name);
      
      if (matchedPlace) {
        aiResult.placeCard.image = matchedPlace.coverUrl || matchedPlace.logoUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500';
      } else {
        aiResult.placeCard.image = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500';
      }
    }

    res.json(aiResult);
    
  } catch (error: any) {
    console.error("AskAI Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    res.json([]);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
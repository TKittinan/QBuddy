import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ปรับ System Instruction ให้บังคับ AI ตอบเป็น JSON เสมอ
// เพื่อให้ฝั่ง Mobile นำข้อมูลไปสร้างเป็น PlaceCard ได้ง่าย
const SYSTEM_INSTRUCTION = `
You are "QBuddy Assistant", an expert in Gastronomy and Beauty & Wellness. 
Your task is to recommend places to users based ONLY on the list of places provided in the context.

1. Information Source: You must use the provided list of places (Name, Category, Description, Image, Distance) to answer.
2. Personalization: If a user asks for food, look for "Restaurant" or "Cafe" types. If they ask for beauty, look for "Salon" or "Spa".
3. Output Format: You MUST respond in valid JSON format ONLY, matching this exact structure:
{
  "text": "Your conversational response in Thai.",
  "placeCard": {
    "name": "Place Name",
    "distance": "Distance (e.g., 0.8 กม.)",
    "category": "Category (e.g., ร้านอาหาร)",
    "image": "Image URL"
  }
}
* Note: If you do not recommend any specific place in your current answer, set "placeCard" to null.
4. Language: Always respond in Thai for the "text" field.
`;

const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash", 
  systemInstruction: SYSTEM_INSTRUCTION,
  generationConfig: {
    responseMimeType: "application/json",
  }
});

export class AIService {
  async generateResponse(prompt: string, contextData: string) { 
    try {
      // รวมข้อมูลร้านค้าเข้ากับคำถามของผู้ใช้
      const fullPrompt = `
        Real-time data of available places:
        ${contextData}

        User Question: ${prompt}
      `;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      
      // ดึงข้อความดิบที่ได้จาก AI (ซึ่งตอนนี้มันเป็นโครงสร้าง JSON แล้ว)
      const rawText = response.text();
      
      // แปลงจากข้อความ JSON ให้กลายเป็น Object แล้วส่งกลับไปให้ Controller
      return JSON.parse(rawText);
      
    } catch (error) {
      console.error("Gemini Error:", error);
      throw new Error("Failed to generate AI response");
    }
  }
}
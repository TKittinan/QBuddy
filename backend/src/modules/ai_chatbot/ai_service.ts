import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// กำหนด System Instruction เป็นภาษาอังกฤษเพื่อความเสถียร
const SYSTEM_INSTRUCTION = `
You are "QBuddy Assistant", an expert in Gastronomy and Beauty & Wellness. 
Your task is to recommend places to users based ONLY on the list of places provided in the context.

1. **Information Source**: You must use the provided list of places (Name, Type, Description) to answer.
2. **Personalization**: If a user asks for food, look for "Restaurant" or "Cafe" types. If they ask for beauty, look for "Salon" or "Spa".
3. **No Rating**: Since we don't have ratings, recommend based on the description or how well it matches the user's request.
4. **Language**: Always respond in Thai. If no place matches, politely suggest something similar or inform them we don't have that specific type yet.
`;

const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash", 
  systemInstruction: SYSTEM_INSTRUCTION 
});

export class AIService {
  // แก้ไขบรรทัดนี้: เพิ่ม contextData: string เข้าไป
  async generateResponse(prompt: string, contextData: string) { 
    try {
      // รวมข้อมูลร้านค้า (Context) เข้ากับคำถามของผู้ใช้
      const fullPrompt = `
        Real-time data of available places:
        ${contextData}

        User Question: ${prompt}
      `;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini Error:", error);
      throw new Error("Failed to generate AI response");
    }
  }
}
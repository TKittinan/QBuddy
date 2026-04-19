import OpenAI from "openai";

// เรียกใช้งาน OpenAI โดยใช้คีย์จาก environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// System Instruction คงเดิมไว้ได้เลย เพราะเขียนบังคับโครงสร้าง JSON ไว้ดีแล้ว
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

export class AIService {
  async generateResponse(prompt: string, contextData: string) { 
    try {
      // รวมข้อมูลร้านค้าเข้ากับคำถามของผู้ใช้
      const fullPrompt = `
        Real-time data of available places:
        ${contextData}

        User Question: ${prompt}
      `;

      // ยิง API ไปที่ OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { role: "user", content: fullPrompt }
        ],
        // บังคับให้ OpenAI ตอบกลับมาเป็น JSON ตามรูปแบบที่ระบุใน System
        response_format: { type: "json_object" },
      });
      
      // ดึงข้อความ JSON ที่ได้จาก OpenAI
      const rawText = response.choices[0].message.content || "{}";
      
      // แปลงจากข้อความ JSON ให้กลายเป็น Object แล้วส่งกลับไปให้ Controller
      return JSON.parse(rawText);
      
    } catch (error) {
      console.error("OpenAI Error:", error);
      throw new Error("Failed to generate AI response");
    }
  }
}
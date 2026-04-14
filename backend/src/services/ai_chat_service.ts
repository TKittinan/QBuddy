import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const chatWithAI = async (message: string) => {
  const prompt = `
You are the AI ​​of the QBuddy app.

Your functions:
- Recommend restaurants
- Recommend activities
- Help users make decisions

Provide short, concise, and friendly answers.

User: ${message}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};
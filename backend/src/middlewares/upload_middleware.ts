import multer from "multer";

// เก็บไฟล์ใน memory (ส่งไป supabase)
const storage = multer.memoryStorage();
export const upload = multer({ storage });
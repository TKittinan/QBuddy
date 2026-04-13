import { Request, Response } from "express";
import { supabase } from "../services/supabase_service";

// upload รูป และ return URL
export const uploadImage = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file" });
    }

    const fileName = `${Date.now()}-${file.originalname}`;

    // upload ไป supabase
    const { data, error } = await supabase.storage
      .from("restaurant-images")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      return res.status(500).json({ error });
    }

    // เอา public URL
    const { data: publicUrl } = supabase.storage
      .from("restaurant-images")
      .getPublicUrl(fileName);

    res.json({
      url: publicUrl.publicUrl,
    });
  } catch (err) {
    res.status(500).json({ message: "error" });
  }
};
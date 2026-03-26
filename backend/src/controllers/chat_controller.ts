import { Request, Response } from "express";
import { prisma } from "./../lib/prisma";

// สร้าง conversation สำหรับ activity เรียกตอน create activity
export const createConversation = async (activity_id: number) => {
  // function นี้ไม่ใช้ req/res เพราะจะเรียกจาก activity

  const exist = await prisma.conversation.findUnique({
    where: { activity_id },
  });

  if (exist) return exist;

  const conversation = await prisma.conversation.create({
    data: {
      activity_id,
    },
  });

  return conversation;
};

// เพิ่ม user เข้า conversation
export const addUserToConversation = async (
  conversation_id: number,
  user_id: number
) => {
  const exist = await prisma.conversation_Participant.findFirst({
    where: {
      conversation_id,
      user_id,
    },
  });

  if (exist) return;

  await prisma.conversation_Participant.create({
    data: {
      conversation_id,
      user_id,
    },
  });
};

// ส่ง message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const conversation_id = Number(req.body.conversation_id);
    const sender_id = Number(req.body.sender_id);
    const message_text = req.body.message_text;

    const data = await prisma.message.create({
      data: {
        conversation_id,
        sender_id,
        message_text,
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};

// ดึง message ของ conversation
export const getMessages = async (req: Request, res: Response) => {
  try {
    const conversation_id = Number(req.params.conversation_id);

    const data = await prisma.message.findMany({
      where: {
        conversation_id,
      },
      include: {
        sender: true, // join user
      },
      orderBy: {
        sent_at: "asc",
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};

// หา conversation จาก activity
export const getConversationByActivity = async (
  req: Request,
  res: Response
) => {
  try {
    const activity_id = Number(req.params.activity_id);

    const data = await prisma.conversation.findUnique({
      where: { activity_id },
      include: {
        participants: true,
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};
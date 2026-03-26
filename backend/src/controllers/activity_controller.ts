import { Request, Response } from "express";
import { prisma } from "./../lib/prisma";

import { createConversation, addUserToConversation } from "./chat_controller";

// สร้าง activity user คนสร้าง = creator
export const createActivity = async (req: Request, res: Response) => {
  try {
    const creator_id = Number(req.body.creator_id);
    const title = req.body.title;
    const description = req.body.description;
    const category = req.body.category;
    const location = req.body.location;
    const activity_datetime = new Date(req.body.activity_datetime);
    const max_participants = Number(req.body.max_participants);

    // check user
    const user = await prisma.user.findUnique({
      where: { user_id: creator_id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // create activity
    const activity = await prisma.activity.create({
      data: {
        creator_id,
        title,
        description,
        category,
        location,
        activity_datetime,
        max_participants,
        status: "open",
      },
    });

    // สร้าง chat room ของ activity นี้
    const conversation = await createConversation(activity.activity_id);

    // เอา creator เข้า chat ด้วย
    await addUserToConversation(conversation.conversation_id, creator_id);

    // creator ต้อง join เอง
    await prisma.activity_Participant.create({
      data: {
        activity_id: activity.activity_id,
        user_id: creator_id,
        status: "joined",
      },
    });

    res.json(activity);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

// join activity
export const joinActivity = async (req: Request, res: Response) => {
  try {
    const activity_id = Number(req.body.activity_id);
    const user_id = Number(req.body.user_id);

    // check activity
    const activity = await prisma.activity.findUnique({
      where: { activity_id },
      include: {
        participants: true,
      },
    });

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    // check เต็มหรือยัง
    if (
      activity.max_participants &&
      activity.participants.length >= activity.max_participants
    ) {
      return res.status(400).json({ message: "Activity full" });
    }

    // check ซ้ำ
    const exist = await prisma.activity_Participant.findFirst({
      where: {
        activity_id,
        user_id,
      },
    });

    if (exist) {
      return res.status(400).json({ message: "Already joined" });
    }

    const data = await prisma.activity_Participant.create({
      data: {
        activity_id,
        user_id,
        status: "joined",
      },
    });

    // หา conversation ของ activity
    const conversation = await prisma.conversation.findUnique({
    where: { activity_id },
    });

    // ถ้ามี chat room → เอา user เข้า
    if (conversation) {
    await addUserToConversation(conversation.conversation_id, user_id);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};

// ออกจาก activity 
export const leaveActivity = async (req: Request, res: Response) => {
  try {
    const activity_id = Number(req.body.activity_id);
    const user_id = Number(req.body.user_id);

    const exist = await prisma.activity_Participant.findFirst({
      where: {
        activity_id,
        user_id,
      },
    });

    if (!exist) {
      return res.status(404).json({ message: "Not joined" });
    }

    await prisma.activity_Participant.delete({
      where: {
        ap_id: exist.ap_id,
      },
    });

    res.json({ message: "left" });
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};

// ดู activity ทั้งหมด
export const getActivities = async (req: Request, res: Response) => {
  try {
    const data = await prisma.activity.findMany({
      include: {
        participants: true,
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};
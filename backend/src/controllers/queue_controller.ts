import { Request, Response } from "express";
import { prisma } from "./../lib/prisma";

// create queue for restaurant 
// restaurant 1 ร้าน มี queue ได้ 1 อัน
export const createQueue = async (req: Request, res: Response) => {
  try {
    const restaurant_id = Number(req.body.restaurant_id);

    const restaurant = await prisma.restaurant.findUnique({
      where: { restaurant_id },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const exist = await prisma.queue.findUnique({
      where: { restaurant_id },
    });

    if (exist) {
      return res.status(400).json({ message: "Queue already exists" });
    }

    const data = await prisma.queue.create({
      data: {
        restaurant_id,
        current_number: 0,
        status: "open",
      },
    });

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};


// join queue
export const joinQueue = async (req: Request, res: Response) => {
  try {
    const queue_id = Number(req.body.queue_id);
    const user_id = Number(req.body.user_id);
    const party_size = Number(req.body.party_size);

    const queue = await prisma.queue.findUnique({
      where: { queue_id },
    });

    if (!queue) {
      return res.status(404).json({ message: "Queue not found" });
    }

    const last = await prisma.queue_Entry.findFirst({
      where: { queue_id },
      orderBy: {
        position: "desc",
      },
    });

    const position = last ? last.position + 1 : 1;

    const data = await prisma.queue_Entry.create({
      data: {
        queue_id,
        user_id,
        party_size,
        position,
        status: "waiting",
      },
    });

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

// leave queue
export const leaveQueue = async (req: Request, res: Response) => {
  try {
    const entry_id = Number(req.params.id);

    const exist = await prisma.queue_Entry.findUnique({
      where: { entry_id },
    });

    if (!exist) {
      return res.status(404).json({ message: "Entry not found" });
    }

    await prisma.queue_Entry.delete({
      where: { entry_id },
    });

    res.json({ message: "removed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

// get queue of restaurant
export const getQueue = async (req: Request, res: Response) => {
  try {
    const restaurant_id = Number(req.params.restaurant_id);

    const data = await prisma.queue.findUnique({
      where: { restaurant_id },
      include: {
        entries: true,
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};


// next queue (admin)
export const nextQueue = async (req: Request, res: Response) => {
  try {
    const queue_id = Number(req.body.queue_id);

    const queue = await prisma.queue.findUnique({
      where: { queue_id },
    });

    if (!queue) {
      return res.status(404).json({ message: "Queue not found" });
    }

    const next = queue.current_number + 1;

    const data = await prisma.queue.update({
      where: { queue_id },
      data: {
        current_number: next,
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};
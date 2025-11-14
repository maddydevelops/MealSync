import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { chatId } = req.query;

    if (!chatId || typeof chatId !== "string") {
      return res.status(400).json({ success: false, message: "chatId is required" });
    }

    // Fetch messages for this chat, ordered by createdAt
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" }, // oldest first
    });

    res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

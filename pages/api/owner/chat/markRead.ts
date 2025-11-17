import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PUT") {
    const { chatId } = req.body;

    if (!chatId) return res.status(400).json({ success: false, error: "chatId is required" });

    try {
      await prisma.chat.update({
        where: { id: chatId },
        data: { read: true },
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: "Failed to mark chat as read" });
    }
  } else {
    res.status(405).json({ success: false, error: "Method not allowed" });
  }
}

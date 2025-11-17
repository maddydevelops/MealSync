import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    const { chatId } = req.query;

    if (!chatId) return res.status(400).json({ success: false, error: "chatId is required" });

    try {
      // Soft delete by setting isDeleted
      await prisma.chat.update({
        where: { id: chatId as string },
        data: { is_deleted: true },
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: "Failed to delete chat" });
    }
  } else {
    res.status(405).json({ success: false, error: "Method not allowed" });
  }
}

// pages/api/owner/chat/send.ts
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { chatId, sender, content, productId, productName, userName, email } = req.body;

      if (!content || !chatId || !sender) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }

      // Check if Chat exists
      let chat = await prisma.chat.findUnique({ where: { id: chatId } });

      // If not, create it
      if (!chat) {
        chat = await prisma.chat.create({
          data: {
            id: chatId,
            productId,
            productName,
            restaurantId: "restaurant-id-placeholder", // <-- Replace with actual restaurant id
            userName,
            userEmail: email,
          },
        });
      }

      // Now create the message
      const saved = await prisma.message.create({
        data: {
          chatId,
          sender,
          content,
          createdAt: new Date(),
        },
      });

      res.status(200).json({ success: true, message: saved });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err });
    }
  } else {
    res.status(405).json({ success: false, error: "Method not allowed" });
  }
}

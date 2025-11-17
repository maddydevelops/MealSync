// pages/api/owner/chat/send.ts
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { chatId, sender, content, productId, productName, userName, email } = req.body;

    if (!content || !chatId || !sender) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Check if chat exists
    let chat = await prisma.chat.findUnique({ where: { id: chatId } });

    if (chat) {
      // If chat was deleted, restore it
      if (chat.is_deleted) {
        chat = await prisma.chat.update({
          where: { id: chatId },
          data: { is_deleted: false },
        });
      }
    } else {
      // If not, create new chat
      chat = await prisma.chat.create({
        data: {
          id: chatId,
          productId,
          productName,
          restaurantId: "restaurant-id-placeholder", // Replace with actual restaurant id
          userName,
          userEmail: email,
        },
      });
    }

    // Create message
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
}

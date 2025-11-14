import {prisma} from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ success: false, message: "Only POST allowed" });

  try {
    const { chatId, productId, productName, userName, userEmail } = req.body;

    // Check if session already exists
    const existing = await prisma.chatSession.findUnique({
      where: { chatId },
    });

    if (existing) return res.json({ success: true });

    // Create new session
    await prisma.chatSession.create({
      data: {
        chatId,
        productId,
        productName,
        userName,
        userEmail,
      },
    });

    return res.json({ success: true });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false });
  }
}

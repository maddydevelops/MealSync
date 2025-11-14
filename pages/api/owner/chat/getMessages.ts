import {prisma} from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chatId } = req.query;

  const messages = await prisma.chatMessage.findMany({
    where: { chatId: String(chatId) },
    orderBy: { timestamp: "asc" }
  });

  res.json({ success: true, messages });
}

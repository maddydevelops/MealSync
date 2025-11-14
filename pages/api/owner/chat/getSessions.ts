import {prisma} from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sessions = await prisma.chatSession.findMany({
      orderBy: { createdAt: "desc" }
    });

    res.json({ success: true, sessions });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

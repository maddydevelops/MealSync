import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { created_at: "desc" },
      take: 20,
    });

    return res.status(200).json(notifications);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

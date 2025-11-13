import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const { id } = req.body;

    // ✅ Case 1: Mark single notification as read
    if (id) {
      const notification = await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
      return res.status(200).json(notification);
    }

    // ✅ Case 2: Mark all notifications as read
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });

    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Notification Read Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const announcements = await prisma.announcement.findMany({
      where: { is_deleted: false },
      orderBy: { created_at: "desc" },
    });

    res.status(200).json(announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
}

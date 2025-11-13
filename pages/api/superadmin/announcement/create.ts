import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { title, description, created_by } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required" });
  }

  try {
    const announcement = await prisma.announcement.create({
      data: {
        title,
        description,
        created_by: created_by || null,
      },
    });

    res.status(201).json(announcement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create announcement" });
  }
}

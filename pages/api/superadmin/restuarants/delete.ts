import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { id } = req.body;

  if (!id) return res.status(400).json({ message: "Restaurant ID is required" });

  try {
    await prisma.restaurant.update({
      where: { id },
      data: { is_deleted: true },
    });

    res.status(200).json({ message: "Restaurant deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting restaurant:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { owner_id } = req.body;

  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        is_deleted: false,
        ...(owner_id ? { owner_id } : {}),
      },
      include: { owner: true, subscription: true },
    });

    res.status(200).json(restaurants);
  } catch (err: any) {
    console.error("Error fetching restaurants:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}

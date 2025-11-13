import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { id, name, description, address, city, country, subscription_id, is_active } = req.body;

  if (!id) return res.status(400).json({ message: "Restaurant ID is required" });

  try {
    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        name,
        description,
        address,
        city,
        country,
        subscription_id: subscription_id || null,
        is_active,
      },
    });

    res.status(200).json(restaurant);
  } catch (err: any) {
    console.error("Error updating restaurant:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}

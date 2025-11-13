import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { name, description, address, city, country, owner_id, subscription_id } = req.body;

  if (!name || !address || !city || !country || !owner_id)
    return res.status(400).json({ message: "Missing required fields" });

  try {
    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        description,
        address,
        city,
        country,
        owner_id,
        subscription_id: subscription_id || null,
      },
    });

    res.status(201).json(restaurant);
  } catch (err: any) {
    console.error("Error creating restaurant:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}

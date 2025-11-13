import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    const ownerEmail = session.user?.email;
    const owner = await prisma.user.findUnique({
      where: { email: ownerEmail },
      include: { restaurants: true },
    });

    if (!owner || !owner.restaurants.length)
      return res.status(400).json({ message: "No restaurant found for this owner" });

    const restaurantId = owner.restaurants[0].id;

    const products = await prisma.menuItem.findMany({
      where: { restaurant_id: restaurantId, is_deleted: false },
      orderBy: { created_at: "desc" },
    });

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
}

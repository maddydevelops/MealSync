// pages/api/owner/categories/create.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { name, restaurant_id } = req.body;

    if (!name || !restaurant_id) {
      return res.status(400).json({ success: false, message: "Name or restaurant ID missing" });
    }

    // Verify that the logged-in owner actually owns this restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurant_id },
    });

    if (!restaurant || restaurant.owner_id !== session.user.id) {
      return res.status(403).json({ success: false, message: "You do not have permission to add categories to this restaurant" });
    }

    // Create the category
    const category = await prisma.category.create({
      data: {
        name,
        restaurant_id,
      },
    });

    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

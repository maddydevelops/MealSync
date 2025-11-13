import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

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

    // Destructure category_id instead of category
    const { name, description, price, category_id, stock, return_policy, images } = req.body;

    const newProduct = await prisma.menuItem.create({
      data: {
        restaurant_id: restaurantId,
        name,
        description: description || null,
        price: Number(price),
        category_id: category_id || null, // ✅ matches Prisma schema
        stock: Number(stock) || 0,
        return_policy: return_policy || null,
        images: images || [],
      },
    });

    res.status(200).json({ success: true, data: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create product", error: err });
  }
}

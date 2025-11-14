// pages/api/products/all.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch all products
    const products = await prisma.menuItem.findMany({
      orderBy: {
        created_at: "desc", // optional: newest first
      },
      include: {
        restaurant: true, // optional: include restaurant details
      },
    });

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}

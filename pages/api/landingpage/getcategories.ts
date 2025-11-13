
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // adjust path if needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only allow GET requests
    if (req.method !== "GET") {
      return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    // Fetch all active categories
    const categories = await prisma.category.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
}

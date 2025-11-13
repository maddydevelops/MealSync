// pages/api/owner/categories/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

interface ResponseData {
  success: boolean;
  data?: any;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { restaurant_id } = req.body;
  if (!restaurant_id) return res.status(400).json({ success: false, message: "restaurant_id required" });

  try {
    const categories = await prisma.category.findMany({
      where: { restaurant_id, is_deleted: false },
      orderBy: { created_at: "desc" },
    });
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

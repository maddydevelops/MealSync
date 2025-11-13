// pages/api/owner/categories/delete.ts
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
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });

  const { category_id } = req.body;
  if (!category_id) return res.status(400).json({ success: false, message: "Category ID required" });

  try {
    const deletedCategory = await prisma.category.update({
      where: { id: category_id },
      data: { is_deleted: true },
    });
    return res.status(200).json({ success: true, data: deletedCategory });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

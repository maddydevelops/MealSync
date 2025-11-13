import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "Product ID is required" });

    const deletedProduct = await prisma.menuItem.update({
      where: { id },
      data: { is_deleted: true },
    });

    res.status(200).json(deletedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete product" });
  }
}

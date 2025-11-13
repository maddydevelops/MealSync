// pages/api/superadmin/user/delete.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.body;

  if (!id) return res.status(400).json({ message: "User ID is required" });

  try {
    const deletedUser = await prisma.user.update({
      where: { id },
      data: { is_deleted: true }, // soft delete
    });

    res.status(200).json({ message: "User deleted successfully", user: deletedUser });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}

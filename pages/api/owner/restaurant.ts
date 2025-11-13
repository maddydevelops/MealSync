import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ success: false, message: "Unauthorized" });

  const restaurant = await prisma.restaurant.findFirst({ where: { owner_id: session.user.id } });
  if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });

  res.status(200).json({ success: true, restaurant });
}

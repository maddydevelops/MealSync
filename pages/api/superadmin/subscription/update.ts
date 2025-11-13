import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id, name, price, duration, itemsAllowed, status } = req.body;

  if (!id) return res.status(400).json({ message: "Subscription ID is required" });

  try {
    const updatedSub = await prisma.subscription.update({
      where: { id },
      data: {
        name,
        price,
        duration,
        itemsAllowed,
        status,
      },
    });

    res.status(200).json(updatedSub);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update subscription" });
  }
}

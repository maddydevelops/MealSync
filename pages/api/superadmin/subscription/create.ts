import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "superadmin") {
    return res.status(403).json({ message: "Unauthorized: Superadmin only" });
  }

  if (req.method === "POST") {
    try {
      const { name, price, duration, itemsAllowed } = req.body;

      if (!name || !price || !duration || !itemsAllowed) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const subscription = await prisma.subscription.create({
        data: {
          name,
          price: Number(price),
          duration: Number(duration),
          itemsAllowed: Number(itemsAllowed),
          status: "active",
        },
      });

      return res.status(201).json(subscription);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating subscription" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

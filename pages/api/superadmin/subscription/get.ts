// pages/api/superadmin/subscription/get.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  try {
    const session = await getServerSession(req, res, authOptions);
    // if (!session || session.user.role !== "superadmin") {
    //   return res.status(403).json({ message: "Unauthorized - superadmin only" });
    // }

    const { id } = req.query;

    if (id && typeof id === "string") {
      const subscription = await prisma.subscription.findUnique({ where: { id ,is_deleted: false  } });
      if (!subscription) return res.status(404).json({ message: "Subscription not found" });
      return res.status(200).json(subscription);
    }

    const subscriptions = await prisma.subscription.findMany({
      orderBy: { created_at: "desc" }, where: { is_deleted: false } } 
    );

    return res.status(200).json(subscriptions);
  } catch (err: any) {
    console.error("Get subscriptions error:", err);
    return res.status(500).json({ message: "Internal server error", details: err.message });
  }
}

// pages/api/superadmin/user/update.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    id,
    first_name,
    last_name,
    email,
    password,
    phone_number,
    address,
    city,
    country,
    company_name,
    cnic,
    subscription_id, // <-- updated to receive subscription id from frontend
    is_active,       // <-- optional for toggling active/inactive
  } = req.body;

  if (!id) return res.status(400).json({ message: "User ID is required" });

  try {
    // Hash password if provided
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Connect subscription if provided
    let subscriptionConnect = undefined;
    if (subscription_id) {
      const subscriptionRecord = await prisma.subscription.findFirst({
        where: { id: subscription_id, is_deleted: false },
      });

      if (!subscriptionRecord) {
        return res.status(400).json({ message: "Subscription not found" });
      }

      subscriptionConnect = { connect: { id: subscriptionRecord.id } };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        first_name,
        last_name,
        email,
        password: hashedPassword,
        phone_number,
        address,
        city,
        country,
        company_name,
        cnic,
        is_active,                  // <-- toggle Active/Inactive
        owned_subscription: subscriptionConnect,
      },
      include: { owned_subscription: true },
    });

    res.status(200).json(updatedUser);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}

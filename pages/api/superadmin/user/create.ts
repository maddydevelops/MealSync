// pages/api/superadmin/user/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    first_name,
    last_name,
    email,
    password,
    phone_number,
    role,
    address,
    city,
    country,
    company_name,
    cnic,
    subscription,
  } = req.body;

  // 1️⃣ Check required fields
  if (!first_name || !email || !password) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    // 2️⃣ Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Find subscription if provided
    let subscriptionRecord = null;
    if (subscription) {
      subscriptionRecord = await prisma.subscription.findFirst({
        where: { name: subscription, is_deleted: false },
      });

      if (!subscriptionRecord) {
        return res.status(400).json({ message: "Subscription not found" });
      }
    }

    // 5️⃣ Create user
    const user = await prisma.user.create({
      data: {
        first_name,
        last_name,
        email,
        password: hashedPassword,
        phone_number,
        role: role || "owner",
        address,
        city,
        country,
        company_name,
        cnic,
        owned_subscription: subscriptionRecord
          ? { connect: { id: subscriptionRecord.id } }
          : undefined,
      },
      include: {
        owned_subscription: true,
      },
    });

    res.status(200).json(user);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}

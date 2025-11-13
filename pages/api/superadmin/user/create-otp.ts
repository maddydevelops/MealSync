// /pages/api/auth/generate-otp.ts
import type { NextApiRequest, NextApiResponse } from "next";
import {prisma} from "@/lib/prisma"; // your prisma client
import { randomInt } from "crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const code = String(randomInt(100000, 999999)); // 6-digit OTP

    const otp = await prisma.oTP.create({
      data: {
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins expiry
      },
    });

    res.status(200).json({ otp: otp.code, userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

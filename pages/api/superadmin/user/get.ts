import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    const users = await prisma.user.findMany({
      where: { is_deleted: false, role: "owner" },
      orderBy: { created_at: "desc" },
      include: {
        owned_subscription: true, 
      },
    });
    const mappedUsers = users.map(u => ({
      id: u.id,
      firstName: u.first_name || "",
      lastName: u.last_name || "",
      email: u.email || "",
      password: u.password || "",
      company_name: u.company_name || "",
      subscription: u.owned_subscription ? { id: u.owned_subscription.id, name: u.owned_subscription.name } : null,
      cnic: u.cnic || "",
      address: u.address || "",
      shopLocation: u.city || "",
      phoneNumber: u.phone_number || "",
      status: u.is_active ? "Active" : "Inactive",
    }));
    res.status(200).json(mappedUsers);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

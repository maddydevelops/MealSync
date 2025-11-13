import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { action, id, title, description } = req.body;

    if (!action) return res.status(400).json({ message: "Action is required" });

    switch (action) {
      case "create":
        if (!title || !description)
          return res.status(400).json({ message: "Title and description are required" });

        const newAnnouncement = await prisma.announcement.create({
          data: { title, description },
        });

        // Create notification
        await prisma.notification.create({
          data: {
            title: "New Announcement",
            message: title,
          },
        });

        return res.status(200).json(newAnnouncement);

      case "update":
        if (!id || !title || !description)
          return res.status(400).json({ message: "ID, title, and description are required" });

        const updatedAnnouncement = await prisma.announcement.update({
          where: { id },
          data: { title, description },
        });

        // Create notification for update
        await prisma.notification.create({
          data: {
            title: "Announcement Updated",
            message: title,
          },
        });

        return res.status(200).json(updatedAnnouncement);

      case "delete":
        if (!id) return res.status(400).json({ message: "ID is required" });

        // Soft delete
        const deletedAnnouncement = await prisma.announcement.update({
          where: { id },
          data: { is_deleted: true },
        });

        // Notification for delete
        await prisma.notification.create({
          data: {
            title: "Announcement Deleted",
            message: deletedAnnouncement.title,
          },
        });

        return res.status(200).json(deletedAnnouncement);

      default:
        return res.status(400).json({ message: "Invalid action" });
    }
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

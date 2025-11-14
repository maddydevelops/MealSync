import { NextApiResponseServerIO } from "@/types/next-auth";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import {prisma} from "@/lib/prisma";

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const io = new ServerIO(res.socket.server as any, {
      path: "/api/socket",
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      // JOIN A CHAT ROOM
      socket.on("joinRoom", (chatId) => {
        socket.join(chatId);
        console.log("User joined room:", chatId);
      });

      // SEND MESSAGE
      socket.on("sendMessage", async (data) => {
        const { chatId, message, sender, time } = data;

        // 🔥 Save message to database
        await prisma.chatMessage.create({
          data: {
            chatId,
            message,
            sender,
          },
        });

        // Broadcast to everyone in the room
        io.to(chatId).emit("receiveMessage", data);
      });
    });

    res.socket.server.io = io;
    console.log("Socket.IO initialized");
  }

  res.end();
}

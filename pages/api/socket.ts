import { Server, Socket } from "socket.io";
import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types/next-auth"; // your extended type
import axios from "axios";

export const config = { api: { bodyParser: false } };

let io: Server;

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    io = new Server(res.socket.server as any, { path: "/api/socket", cors: { origin: "*" } });
    res.socket.server.io = io;

    io.on("connection", (socket: Socket) => {
      console.log("Socket connected: " + socket.id);

      // Join a chat room (user or admin)
      socket.on("joinRoom", (chatId: string) => socket.join(chatId));

      // Admin joins admin-room
      socket.on("joinAdminRoom", () => socket.join("admin-room"));

      // Send a message
      socket.on("sendMessage", async (msgData: any) => {
        try {
          // Save message via API
          await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/owner/chat/send`,
            msgData
          );

          // Emit to all clients in the chat room (including admin if joined)
          io.in(msgData.chatId).emit("receiveMessage", msgData);

          // Notify admins in admin-room if not in this chat
          io.to("admin-room").emit("newMessageNotification", msgData);
        } catch (err) {
          console.log("Error saving message:", err);
        }
      });
    });
  }

  res.end();
}

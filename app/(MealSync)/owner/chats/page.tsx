"use client";

import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

let socket: any = null;
const getSocket = () => {
  if (!socket) socket = io("/", { path: "/api/socket" });
  return socket;
};

export default function AdminChatPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);

  // Fetch all chat sessions
  const fetchChats = async () => {
    try {
      const res = await axios.get("/api/owner/chat/getSessions");
      setChats(res.data.sessions || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch chats");
    }
  };

  // Open chat
  const openChat = async (chat: any) => {
    setActiveChat(chat);

    try {
      // Fetch messages from DB
      const res = await axios.get(`/api/owner/chat/getMessages?chatId=${chat.id}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error(err);
      setMessages([]);
    }

    const socket = getSocket();
    socket.emit("joinRoom", chat.id);

    socket.off("receiveMessage");
    socket.on("receiveMessage", (msg: any) => {
      if (msg.chatId === chat.id) setMessages((prev) => [...prev, msg]);
    });
  };

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || !activeChat) return;

    const msgData = {
      chatId: activeChat.id,
      sender: "restaurant",
      content: message,
      time: new Date(),
    };

    try {
      await axios.post("/api/owner/chat/send", msgData);

      const socket = getSocket();
      socket.emit("sendMessage", msgData);

      setMessages((prev) => [...prev, msgData]);
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    }
  };

  // Listen for new messages not in active chat
  useEffect(() => {
    const socket = getSocket();
    socket.emit("joinAdminRoom");

    socket.on("newMessageNotification", (msg: any) => {
      if (!activeChat || activeChat.id !== msg.chatId) {
        toast(`New message from ${msg.userName || msg.email}`);
        fetchChats();
      }
    });

    return () => socket.off("newMessageNotification");
  }, [activeChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Chat list */}
      <Card className="p-4 h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Available Chats</h2>
        {chats.length === 0 && <p className="text-muted-foreground">No chats yet</p>}
        {chats.map((chat) => (
          <Card
            key={chat.id}
            className={`p-4 mb-3 cursor-pointer hover:bg-secondary transition-colors duration-200 ${
              activeChat?.id === chat.id ? "border-2 border-primary" : ""
            }`}
            onClick={() => openChat(chat)}
          >
            <p className="font-bold">{chat.userName}</p>
            <p className="text-sm text-muted-foreground">{chat.userEmail}</p>
            <p className="text-xs mt-1">Product: {chat.productName}</p>
          </Card>
        ))}
      </Card>

      {/* Chat box */}
      <Card className="p-4 h-[80vh] md:col-span-2 flex flex-col">
        {activeChat ? (
          <>
            <div className="border-b pb-2 mb-2">
              <h2 className="text-xl font-bold">{activeChat.userName}</h2>
              <p className="text-sm text-muted-foreground">Product: {activeChat.productName}</p>
            </div>
            <div ref={messagesRef} className="flex-1 overflow-y-auto border p-3 rounded">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`mb-3 p-2 rounded max-w-[70%] ${
                    m.sender === "restaurant" ? "bg-primary text-primary-foreground ml-auto" : "bg-secondary text-secondary-foreground mr-auto"
                  }`}
                >
                  {m.content}
                  <p className="text-xs text-muted-foreground text-right mt-1">
                    {new Date(m.time).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Input
                placeholder="Type a message..."
                value={message}
                className="flex-1"
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground mt-20">Select a chat to start conversation</p>
        )}
      </Card>
    </div>
  );
}

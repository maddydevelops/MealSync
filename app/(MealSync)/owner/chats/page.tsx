"use client";

import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

let socket: any = null;

// Prevent multiple socket instances
const getSocket = () => {
  if (!socket) {
    socket = io("/", { path: "/api/socket" });
  }
  return socket;
};

export default function AdminChatPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const messagesRef = useRef<HTMLDivElement>(null);

  // Fetch all chat sessions from database
  const fetchChats = async () => {
    try {
      const res = await axios.get("/api/owner/chat/getSessions", {
        headers: { "Cache-Control": "no-cache" },
      });
      setChats(res.data.sessions || []);
    } catch (e) {
      console.log(e);
    }
  };

  // Scroll messages to bottom
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // When admin selects a chat
  const openChat = async (chat: any) => {
    setActiveChat(chat);

    try {
      const res = await axios.get(
        `/api/owner/chat/getMessages?chatId=${chat.chatId}`
      );
      setMessages(res.data.messages || []);
    } catch (e) {
      console.log(e);
      setMessages([]);
    }

    const socket = getSocket();
    socket.emit("joinRoom", chat.chatId);

    // Remove old listener to prevent duplicates
    socket.off("receiveMessage");
    socket.on("receiveMessage", (msg: any) => {
      if (msg.chatId === chat.chatId) {
        setMessages((prev) => [...prev, msg]);
      }
    });
  };

  // Send message from admin
  const sendMessage = () => {
    if (!message.trim() || !activeChat) return;

    const socket = getSocket();

    const msgData = {
      chatId: activeChat.chatId,
      message,
      sender: "restaurant",
      time: new Date(),
    };

    socket.emit("sendMessage", msgData);
    setMessages((prev) => [...prev, msgData]);
    setMessage("");
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* CHAT LIST */}
      <Card className="p-4 h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Customer Chats</h2>

        {chats.length === 0 && <p className="text-muted-foreground">No chats yet</p>}

        {chats.map((chat) => (
          <Card
            key={chat.id}
            className={`p-4 mb-3 cursor-pointer hover:bg-secondary transition-colors duration-200 ${
              activeChat?.chatId === chat.chatId ? "border-2 border-primary" : ""
            }`}
            onClick={() => openChat(chat)}
          >
            <p className="font-bold">{chat.userName}</p>
            <p className="text-sm text-muted-foreground">{chat.userEmail}</p>
            <p className="text-xs mt-1">Product: {chat.productName}</p>
          </Card>
        ))}
      </Card>

      {/* CHAT BOX */}
      <Card className="p-4 h-[80vh] md:col-span-2 flex flex-col">
        {activeChat ? (
          <>
            <div className="border-b pb-2 mb-2">
              <h2 className="text-xl font-bold">{activeChat.userName}</h2>
              <p className="text-sm text-muted-foreground">
                Product: {activeChat.productName}
              </p>
            </div>

            {/* Messages */}
            <div
              ref={messagesRef}
              className="flex-1 overflow-y-auto border p-3 rounded animate-fade-up"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`mb-3 p-2 rounded max-w-[70%] wrap-break-word ${
                    m.sender === "restaurant"
                      ? "bg-primary text-primary-foreground ml-auto animate-bounce-slow"
                      : "bg-secondary text-secondary-foreground mr-auto animate-bounce-slow"
                  }`}
                >
                  {m.message}
                </div>
              ))}
            </div>

            {/* Input box */}
            <div className="flex gap-2 mt-3">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button onClick={sendMessage} className="px-6">
                Send
              </Button>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground mt-20">
            Select a chat to start conversation
          </p>
        )}
      </Card>
    </div>
  );
}

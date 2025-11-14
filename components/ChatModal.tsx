"use client";

import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";

let socket: any = null;
const getSocket = () => {
  if (!socket) {
    socket = io("/", {
      path: "/api/socket",
      transports: ["websocket"],
    });
  }
  return socket;
};

export default function ChatModal({ isOpen, onClose, product }: any) {
  const [step, setStep] = useState<"user" | "chat">("user");
  const [user, setUser] = useState({ name: "", email: "" });
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [chatId, setChatId] = useState("");
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const socket = getSocket();

  // Listen to incoming messages for this chat
  useEffect(() => {
    socket.on("receiveMessage", (msg: any) => {
      if (msg.chatId === chatId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [chatId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Start chat
  const startChat = async () => {
    if (!user.name || !user.email) return;

    const generatedChatId = `${product.id}-${user.email}`;
    setChatId(generatedChatId);

    socket.emit("joinRoom", generatedChatId);
    setStep("chat");

    // Load previous messages from DB
    try {
      const res = await axios.get(`/api/owner/chat/getMessages?chatId=${generatedChatId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.log(err);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!message.trim()) return;

    const msgData = {
      chatId,
      sender: "user",
      content: message, // Prisma expects "content"
      productId: product.id,
      productName: product.name,
      userName: user.name,
      email: user.email,
      time: new Date(),
    };

    try {
      // Save message to DB
      await axios.post("/api/owner/chat/send", msgData);

      // Emit via Socket.IO
      socket.emit("sendMessage", msgData);

      // Update local state
      setMessages((prev) => [...prev, msgData]);
      setMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-up">
      <div className="bg-card text-card-foreground p-6 rounded-2xl w-full max-w-md shadow-xl border border-border animate-zoom-slow">
        {/* Close button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-2xl font-bold text-destructive hover:text-primary transition-all"
          >
            ×
          </button>
        </div>

        {/* User Info Step */}
        {step === "user" && (
          <>
            <h2 className="text-2xl font-bold mb-6 text-primary-foreground text-gradient">
              Chat About {product.name}
            </h2>
            <Input
              placeholder="Your Name"
              className="mb-3 border-border focus:border-primary focus:ring-primary rounded-lg"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
            <Input
              placeholder="Your Email"
              className="mb-5 border-border focus:border-primary focus:ring-primary rounded-lg"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all animate-bounce-slow"
              onClick={startChat}
            >
              Start Chat
            </Button>
          </>
        )}

        {/* Chat Step */}
        {step === "chat" && (
          <>
            <h2 className="text-xl font-bold mb-4 text-primary-foreground text-gradient">
              Chat about: {product.name}
            </h2>
            <div
              ref={chatBoxRef}
              className="h-64 overflow-y-auto border border-border p-3 rounded-xl bg-background"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`mb-2 p-3 rounded-xl max-w-[80%] wrap-break-word shadow-sm ${
                    m.sender === "user"
                      ? "ml-auto bg-primary text-primary-foreground animate-slide-left"
                      : "bg-muted text-muted-foreground animate-slide-left"
                  }`}
                >
                  <p className="text-sm">{m.content}</p>
                  <p className="text-xs mt-1 text-muted-foreground text-right">
                    {new Date(m.time).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Input
                placeholder="Type message..."
                value={message}
                className="flex-1 border-border focus:border-primary focus:ring-primary rounded-lg"
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all rounded-lg"
                onClick={sendMessage}
              >
                Send
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

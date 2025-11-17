"use client";

import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { X, Send, Paperclip, Clock } from 'lucide-react';

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

// Helper function to get initials for avatar
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to get a consistent color for avatar
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-cyan-500",
    "bg-indigo-500",
  ];
  const hash = name.charCodeAt(0) % colors.length;
  return colors[hash];
};

export default function ChatModal({ isOpen, onClose, product }: any) {
  const [step, setStep] = useState<"user" | "chat">("user");
  const [user, setUser] = useState({ name: "", email: "" });
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [chatId, setChatId] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const socket = getSocket();

  // Persistent socket listener
  useEffect(() => {
    const handleReceiveMessage = (msg: any) => {
      if (msg.chatId === chatId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.time === msg.time && m.content === msg.content))
            return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [chatId]);

  // Scroll to bottom
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
      const res = await axios.get(
        `/api/owner/chat/getMessages?chatId=${generatedChatId}`
      );
      setMessages(res.data.messages || []);
    } catch (err) {
      console.log(err);
    }
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!message.trim() && !selectedFile) return;

    setLoading(true);
    let imageData = null;

    // Handle image upload
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const res = await axios.post("/api/upload/image", formData);
        imageData = res.data.imageUrl;
      } catch (err) {
        console.error("Image upload failed:", err);
        setLoading(false);
        return;
      }
    }

    const msgData = {
      chatId,
      sender: "user",
      content: message || (imageData ? "[Image]" : ""),
      image: imageData,
      productId: product.id,
      productName: product.name,
      userName: user.name,
      email: user.email,
      time: new Date(),
      type: imageData ? "image" : "text",
    };

    try {
      // Save to DB
      await axios.post("/api/owner/chat/send", msgData);

      // Emit to server
      socket.emit("sendMessage", msgData);

      // Clear input
      setMessage("");
      setSelectedFile(null);
      setImagePreview(null);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-card text-card-foreground rounded-2xl w-full max-w-md shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="  p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl text-gradient font-bold">
              {step === "user" ? "Start a Conversation" : product.name}
            </h1>
            {step === "chat" && (
              <p className=" text-white  text-sm ">Chat as <span className="text-gradient"> {user.name}</span></p>
            )}
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info Step */}
        {step === "user" && (
          <div className="flex-1 overflow-auto p-6 space-y-4 animate-slideUp">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Full Name
              </label>
              <Input
                placeholder="John Doe"
                className="border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && startChat()}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Email Address
              </label>
              <Input
                placeholder="john@example.com"
                type="email"
                className="border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && startChat()}
              />
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Your information will be used to track our conversation about this product.
            </p>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg transition-all"
              onClick={startChat}
              disabled={!user.name || !user.email}
            >
              Start Chat
            </Button>
          </div>
        )}

        {/* Chat Step */}
        {step === "chat" && (
          <>
            <div
              ref={chatBoxRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50"
            >
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground text-center text-sm">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 animate-slideUp ${
                      m.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Avatar for admin messages */}
                    {m.sender !== "user" && (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getAvatarColor(
                          m.userName || "Admin"
                        )}`}
                      >
                        {getInitials(m.userName || "Admin")}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`max-w-xs rounded-2xl px-4 py-3 shadow-sm transition-all ${
                        m.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted text-muted-foreground rounded-bl-none border border-border"
                      }`}
                    >
                      {m.type === "image" && m.image ? (
                        <div className="space-y-2">
                          <img
                            src={m.image || "/placeholder.svg"}
                            alt="Shared image"
                            className="rounded-lg max-w-xs h-auto"
                          />
                          {m.content && m.content !== "[Image]" && (
                            <p className="text-sm">{m.content}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm wrap-break-word">{m.content}</p>
                      )}
                      <div
                        className={`text-xs mt-1 flex items-center gap-1 ${
                          m.sender === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground/60"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {new Date(m.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {/* Avatar for user messages */}
                    {m.sender === "user" && (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getAvatarColor(
                          user.name
                        )}`}
                      >
                        {getInitials(user.name)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="px-4 pt-3 pb-2 bg-background border-t border-border">
                <div className="relative inline-block">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="rounded-lg max-h-32 w-auto"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedFile(null);
                    }}
                    className="absolute -top-2 -right-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-border p-4 bg-card space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  className="flex-1 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full"
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={loading}
                />

                {/* Image Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-secondary text-primary transition-all"
                  disabled={loading}
                  title="Attach image"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Send Button */}
                <Button
                  className="rounded-full p-2 h-auto bg-primary hover:bg-primary/90 text-primary-foreground transition-all disabled:opacity-50"
                  onClick={sendMessage}
                  disabled={(!message.trim() && !selectedFile) || loading}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Send, Trash2, MessageSquare } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

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
  const [deleteChatTarget, setDeleteChatTarget] = useState<any>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const fetchChats = async () => {
    try {
      const res = await axios.get("/api/owner/chat/getSessions");
      setChats(res.data.sessions || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch chats");
    }
  };

  const openChat = async (chat: any) => {
    setActiveChat(chat);

    try {
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

  const handleDeleteChat = async () => {
    if (!deleteChatTarget) return;
    try {
      await axios.post("/api/owner/chat/delete", { chatId: deleteChatTarget.id });
      toast.success("Chat deleted successfully");
      setChats(chats.filter((c) => c.id !== deleteChatTarget.id));
      if (activeChat?.id === deleteChatTarget.id) setActiveChat(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete chat");
    } finally {
      setDeleteChatTarget(null);
    }
  };

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

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    fetchChats();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date: any) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Chat list sidebar */}
      <div className="w-full md:w-80 border-r border-border bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Messages</h1>
          </div>
          <p className="text-xs text-muted-foreground">{chats.length} conversations</p>
        </div>

        {/* Chats list */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No chats yet</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div key={chat.id}>
                <button
                  onClick={() => openChat(chat)}
                  className={`w-full px-3 py-3 border-b border-border hover:bg-secondary transition-colors text-left group relative ${
                    activeChat?.id === chat.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-semibold">
                      {getInitials(chat.userName)}
                    </div>

                    {/* Chat info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {chat.userName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{chat.userEmail}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Product: {chat.productName}
                      </p>
                    </div>
                  </div>

                  {/* Delete button - visible on hover */}
                  <AlertDialog
                    open={!!deleteChatTarget && deleteChatTarget.id === chat.id}
                    onOpenChange={() => setDeleteChatTarget(null)}
                  >
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteChatTarget(chat);
                        }}
                        className="absolute top-3 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive transition-all"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete chat with {chat.userName}? This action
                          can be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteChat}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-background">
        {activeChat ? (
          <>
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                  {getInitials(activeChat.userName)}
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">{activeChat.userName}</h2>
                  <p className="text-xs text-muted-foreground">
                    Product: {activeChat.productName}
                  </p>
                </div>
              </div>
            </div>
            <div
              ref={messagesRef}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${m.sender === "restaurant" ? "justify-end" : "justify-start"}`}
                  >
                    {/* User avatar for customer messages */}
                    {m.sender !== "restaurant" && (
                      <div className="w-8 h-8 rounded-full bg-secondary/50 shrink-0" />
                    )}

                    {/* Message bubble */}
                    <div
                      className={`flex flex-col gap-1 max-w-xs ${
                        m.sender === "restaurant" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-lg text-sm leading-relaxed ${
                          m.sender === "restaurant"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-secondary text-secondary-foreground rounded-bl-none"
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-xs text-muted-foreground px-2">
                        {formatTime(m.time)}
                      </span>
                    </div>

                    {/* Restaurant avatar for restaurant messages */}
                    {m.sender === "restaurant" && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Message input */}
            <div className="px-6 py-4 border-t border-border bg-card">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 bg-background"
                />
                <Button
                  onClick={sendMessage}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-base font-medium">Select a chat to start conversation</p>
            <p className="text-sm mt-1">Choose from available conversations in the sidebar</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Send, Trash2, MessageSquare, Bell, Search, MoreVertical, Smile, Paperclip } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

let socket: any = null;
const getSocket = () => {
  if (!socket) socket = io("/", { path: "/api/socket" });
  return socket;
};

// Avatar color generator based on user name
const AVATAR_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA502", "#6C5CE7",
  "#00B894", "#FF7675", "#74B9FF", "#A29BFE", "#81ECEC"
];

const getAvatarColor = (name: string) => {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

const formatTime = (date: any) => new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const formatDate = (date: any) => {
  const today = new Date();
  const messageDate = new Date(date);
  const isToday = messageDate.toDateString() === today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = messageDate.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return messageDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function AdminChatPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [deleteChatTarget, setDeleteChatTarget] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [filteredChats, setFilteredChats] = useState<any[]>([]);
  const messagesRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch chat sessions
  const fetchChats = async () => {
    try {
      const res = await axios.get("/api/owner/chat/getSessions");
      const activechats = res.data.sessions?.filter((c: any) => !c.is_deleted) || [];
      setChats(activechats);
      const unread = activechats.filter((c: any) => !c.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch chats");
    }
  };

  // Filter chats based on search query
  useEffect(() => {
    const filtered = chats.filter(chat =>
      chat.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredChats(filtered);
  }, [searchQuery, chats]);

  // Open a chat
  const openChat = async (chat: any) => {
    setActiveChat(chat);

    // Mark chat as read
    if (!chat.read) {
      try {
        await axios.put("/api/owner/chat/markRead", { chatId: chat.id });
        setChats(prev => prev.map(c => c.id === chat.id ? { ...c, read: true } : c));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }

    // Fetch messages
    try {
      const res = await axios.get(`/api/owner/chat/getMessages?chatId=${chat.id}`);
      setMessages(res.data.messages?.filter((m: any) => !m.is_deleted) || []);
    } catch (err) {
      console.error(err);
      setMessages([]);
    }

    const socket = getSocket();
    socket.emit("joinRoom", chat.id);

    socket.off("receiveMessage");
    socket.on("receiveMessage", (msg: any) => {
      const chatExists = chats.find(c => c.id === msg.chatId && !c.is_deleted);
      if (!chatExists) return;

      if (msg.chatId === chat.id) setMessages(prev => [...prev, msg]);
      else setChats(prev => prev.map(c => c.id === msg.chatId ? { ...c, read: false } : c));
    });
  };

  // Send a message
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
    // Emit to server (server will send it back via newMessageNotification)
    getSocket().emit("sendMessage", msgData);
    setMessage("");
    messageInputRef.current?.focus();
  } catch (err) {
    console.error(err);
    toast.error("Failed to send message");
  }
};



  // Delete chat
  const handleDeleteChat = async () => {
    if (!deleteChatTarget) return;
    try {
      await axios.post("/api/owner/chat/delete", { chatId: deleteChatTarget.id });
      toast.success("Chat deleted successfully");
      setChats(prev => prev.filter(c => c.id !== deleteChatTarget.id));
      if (activeChat?.id === deleteChatTarget.id) setActiveChat(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete chat");
    } finally {
      setDeleteChatTarget(null);
    }
  };

  // Listen for new messages
useEffect(() => {
  const socket = getSocket();

  socket.emit("joinAdminRoom");

  // Listen to all incoming messages
  const handleNewMessage = (msg: any) => {
    // Add only if not deleted
    if (msg.is_deleted) return;

    // Update chats list
    setChats(prevChats => {
      const chatIndex = prevChats.findIndex(c => c.id === msg.chatId);
      if (chatIndex !== -1) {
        const updatedChat = {
          ...prevChats[chatIndex],
          lastMessageTime: msg.time,
          read: activeChat?.id === msg.chatId,
        };
        const newChats = [...prevChats];
        newChats.splice(chatIndex, 1);
        return [updatedChat, ...newChats];
      } else {
        return [{
          id: msg.chatId,
          userName: msg.userName || msg.email,
          userEmail: msg.email,
          productName: msg.productName || "",
          read: false,
          lastMessageTime: msg.time,
          createdAt: msg.time,
        }, ...prevChats];
      }
    });

    // Update unread count
    if (!activeChat || activeChat.id !== msg.chatId) {
      toast(`New message from ${msg.userName || msg.email}`);
      setUnreadCount(prev => prev + 1);
    }

    // Add to messages if active chat
    if (activeChat?.id === msg.chatId) {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.time === msg.time && m.content === msg.content)) return prev;
        return [...prev, msg];
      });
    }
  };

  socket.on("newMessageNotification", handleNewMessage);

  return () => {
    socket.off("newMessageNotification", handleNewMessage);
  };
}, [activeChat]);


  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesRef.current) {
      setTimeout(() => {
        if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }, 0);
    }
  }, [messages]);

  // Fetch chats on mount
  useEffect(() => {
    fetchChats();
  }, []);

  // Group messages by date
  const groupedMessages = messages.reduce((acc: any, msg: any) => {
    const date = formatDate(msg.time);
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-96 border-r border-border bg-card flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                M
              </div>
              <h1 className="text-xl font-bold text-foreground">Messages</h1>
            </div>
            <div className="relative">
              <button className="p-2 hover:bg-secondary rounded-full transition-all duration-200 relative">
                <Bell className="w-5 h-5 text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary text-foreground placeholder:text-muted-foreground border-0"
            />
          </div>

          <p className="text-xs text-muted-foreground mt-3">{filteredChats.length} conversations</p>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No chats found</p>
            </div>
          ) : (
            filteredChats.map((chat, idx) => (
              <div key={chat.id}>
                <button
                  onClick={() => openChat(chat)}
                  className={`w-full px-3 py-3 border-b border-border hover:bg-secondary transition-all duration-200 text-left group relative ${
                    activeChat?.id === chat.id ? "bg-primary/10 border-l-4 border-l-primary" : ""
                  } animate-slideIn`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className="w-12 h-12 rounded-full text-white flex items-center justify-center shrink-0 text-sm font-bold shadow-md"
                      style={{ backgroundColor: getAvatarColor(chat.userName) }}
                    >
                      {getInitials(chat.userName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-foreground truncate">{chat.userName}</p>
                        <p className="text-xs text-muted-foreground ml-2 shrink-0">{formatTime(chat.lastMessageTime || chat.createdAt)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">{chat.userEmail}</p>
                      <p className="text-xs text-muted-foreground truncate mt-1">📦 {chat.productName}</p>
                      {!chat.read && (
                        <span className="absolute top-4 right-3 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg" />
                      )}
                    </div>
                  </div>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background overflow-hidden">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full text-white flex items-center justify-center text-sm font-bold shadow-md"
                  style={{ backgroundColor: getAvatarColor(activeChat.userName) }}
                >
                  {getInitials(activeChat.userName)}
                </div>
                <div>
                  <h2 className="font-semibold text-foreground text-lg">{activeChat.userName}</h2>
                  <p className="text-xs text-muted-foreground">📦 {activeChat.productName}</p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-secondary">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-muted-foreground">
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-muted-foreground">
                    Mute Notifications
                  </DropdownMenuItem>
                  <AlertDialog
                    open={!!deleteChatTarget && deleteChatTarget.id === activeChat.id}
                    onOpenChange={() => setDeleteChatTarget(null)}
                  >
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          setDeleteChatTarget(activeChat);
                        }}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        Delete Chat
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this conversation with {activeChat.userName}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteChat} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Messages Area */}
            <div ref={messagesRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-linear-to-b from-background to-background">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-base font-medium">Start a conversation</p>
                  <p className="text-sm mt-1">No messages yet. Send a message to begin.</p>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, dateMessages]: [string, any]) => (
                  <div key={date}>
                    {/* Date Separator */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 border-t border-border"></div>
                      <p className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full">{date}</p>
                      <div className="flex-1 border-t border-border"></div>
                    </div>

                    {/* Messages for this date */}
                    <div className="space-y-3">
                      {(dateMessages as any[]).map((m, i) => (
                        <div key={i} className={`flex gap-3 animate-slideUp ${m.sender === "restaurant" ? "justify-end" : "justify-start"}`}>
                          {m.sender !== "restaurant" && (
                            <div
                              className="w-8 h-8 rounded-full text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-md"
                              style={{ backgroundColor: getAvatarColor(activeChat.userName) }}
                            >
                              {getInitials(activeChat.userName)}
                            </div>
                          )}
                          <div className={`flex flex-col gap-1 ${m.sender === "restaurant" ? "items-end" : "items-start"} max-w-xs`}>
                            <div
                              className={`px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm hover:shadow-md transition-shadow duration-200 ${
                                m.sender === "restaurant"
                                  ? "bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                                  : "bg-secondary text-foreground rounded-bl-none"
                              }`}
                            >
                              {m.content}
                            </div>
                            <span className="text-xs text-muted-foreground px-2">{formatTime(m.time)}</span>
                          </div>
                          {m.sender === "restaurant" && (
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-blue-600 shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-md">
                              A
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 border-t border-border bg-card flex gap-2 items-end">
              <Button  onClick={() => fileInputRef.current?.click()} variant="ghost" size="icon" className="shrink-0 hover:bg-secondary">
                <Paperclip className="w-5 h-5 text-foreground" />
              </Button>
              <Input
                ref={messageInputRef}
                placeholder="Type a message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                className="flex-1 bg-secondary text-foreground placeholder:text-muted-foreground border-0 focus:ring-0 min-h-10"
              />
              <Button
                onClick={sendMessage}
                size="icon"
                className="shrink-0 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-semibold">Select a chat to start</p>
            <p className="text-sm mt-2">Choose from available conversations in the sidebar</p>
          </div>
        )}
      </div>
    </div>
  );
}

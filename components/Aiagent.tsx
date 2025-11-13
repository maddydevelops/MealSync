"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { X, Minimize2, Maximize2, CheckCircle2, Trash2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AIAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm Mealsync AI Agent. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [pageLoadPopup, setPageLoadPopup] = useState(true);

  const [bookingStep, setBookingStep] = useState<
    "none" | "askName" | "askTime" | "confirmed"
  >("none");
  const [userName, setUserName] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [tableNumber, setTableNumber] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Suggested questions
  const suggestedQuestions = [
    "Reserve Table",
    "Restaurant Hours",
    "Today's Special Offers",
    "Location",
    "ContactUS"
  ];

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Hide page-load popup after 3s
  useEffect(() => {
    const timer = setTimeout(() => setPageLoadPopup(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    handleSend(text);
  };

  const handleSend = (overrideInput?: string) => {
    const msg = overrideInput || input.trim();
    if (!msg) return;

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");

    const lower = msg.toLowerCase();

    if (bookingStep === "askName") {
      setUserName(msg);
      setBookingStep("askTime");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Thanks ${msg}, what time would you like to reserve?`,
        },
      ]);
      return;
    }

    if (bookingStep === "askTime") {
      setBookingTime(msg);
      const randomTable = Math.floor(Math.random() * 10) + 1;
      setTableNumber(randomTable);
      setBookingStep("confirmed");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ Table #${randomTable} reserved for ${userName} at ${msg}! Enjoy your meal! 🍽️`,
        },
      ]);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 4000);
      setBookingStep("none");
      return;
    }

    // Normal responses
    let reply = "🤖 Sorry, I didn't understand that. Can you try again?";
    if (lower.includes("offer") || lower.includes("special")) {
      reply =
        "🎉 Today’s special offer: Get 25% OFF on all main courses! Limited time only.";
    } else if (lower.includes("hour") || lower.includes("time")) {
      reply = "🕐 We’re open from 10 AM to 11 PM, Monday through Sunday.";
    } else if (lower.includes("location") || lower.includes("where")) {
      reply = "📍 We’re located at Main Boulevard, Gulberg, Lahore.";
    }
    else if (lower.includes("contact") || lower.includes("where")) {
      reply = "📍 We’re are on Whatsapp - 03026164892";
    } else if (
      lower.includes("reserve") ||
      lower.includes("book") ||
      lower.includes("table")
    ) {
      reply = "🍽️ Great! Can I have your name for the reservation?";
      setBookingStep("askName");
    }else if (
      lower.includes("okay") ||
      lower.includes("by") ||
      lower.includes("thanks")
    ){
      reply = "🍽️ Great!Thankyou have a Graet Day- See you soon At MealSync";
    }

    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
  };

  // Clear chat
  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "👋 Hi! I'm Mealsync AI Agent. How can I help you today?",
      },
    ]);
    setBookingStep("none");
    setUserName("");
    setBookingTime("");
    setTableNumber(null);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Page load popup */}
      {pageLoadPopup && (
        <div className="absolute -top-14 right-12 bg-black/70 text-white px-6 py-2 rounded-lg shadow-lg text-sm min-w-[220px] max-w-xs animate-slide-left">
          👋 Hi! I am <span className="text-gradient">MealSync</span>  AI Agent. How can I help you?
        </div>
      )}

      {/* Reservation popup */}
      {showPopup && (
        <div className="absolute -top-14 right-0 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-slide-left">
          <CheckCircle2 size={16} /> Table #{tableNumber} reserved for{" "}
          {userName} at {bookingTime}!
        </div>
      )}

      {/* Avatar */}
      <div className="relative group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-20 h-20 rounded-full shadow-lg overflow-hidden border-2 cursor-pointer hover:scale-110 transition-transform animate-bounce-slow"
        >
          <img
            src="/avatar.png"
            alt="AI Avatar"
            className="w-full h-full object-cover"
          />
        </button>

        {/* Tooltip */}
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-gradient">MealSync</span> Assistant
        </span>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`bg-background border-2 border-primary/20 rounded-2xl shadow-2xl transition-all duration-300 flex flex-col ${
            isMinimized ? "w-80 h-16" : "w-96 h-[500px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <h3 className="font-semibold text-foreground">
                <span className="text-gradient">MealSync</span> AI Assistant
              </h3>
            </div>
            <div className="flex gap-2">
              {/* Clear Chat Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {msg.content}
                      {/* Suggested questions only under first message */}
                      {idx === 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {suggestedQuestions.map((q) => (
                            <Button
                              key={q}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestionClick(q)}
                            >
                              {q}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask me anything..."
                    className="flex-1 px-4 py-2 rounded-full bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    onClick={() => handleSend()}
                    className="rounded-full"
                  >
                    →
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAgent;

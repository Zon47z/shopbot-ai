"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Phone, Video, Info, Heart, Send, ImageIcon } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_REPLIES = [
  "Vos tarifs ?",
  "Horaires",
  "Prendre RDV",
  "Balayage",
];

export default function InstagramDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour et bienvenue chez Élégance Paris ! ✨ Comment puis-je vous aider ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          mode: "demo",
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Désolé, une erreur est survenue." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Back link */}
      <div className="w-full max-w-[420px] mb-3">
        <Link href="/demo" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft size={16} />
          Retour aux démos
        </Link>
      </div>

      {/* iPhone frame */}
      <div className="w-full max-w-[420px] bg-black rounded-[2.5rem] p-3 shadow-2xl">
        <div className="bg-white rounded-[2rem] overflow-hidden flex flex-col" style={{ height: "700px" }}>

          {/* Instagram DM Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-0">
              <div className="flex items-center gap-3">
                <ArrowLeft size={22} className="text-gray-900" />
                <div className="flex items-center gap-2.5">
                  {/* Profile picture with gradient ring */}
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                      <div className="w-full h-full rounded-full bg-white p-[2px]">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">EP</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-gray-900">elegance.paris</span>
                      <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.5 14.5l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z"/>
                      </svg>
                    </div>
                    <p className="text-[11px] text-green-600 leading-tight">En ligne</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone size={20} className="text-gray-900" />
                <Video size={22} className="text-gray-900" />
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-white">
            {/* Date separator */}
            <div className="text-center mb-3">
              <span className="text-[11px] text-gray-400">Aujourd&apos;hui</span>
            </div>

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mr-2 mt-auto mb-1">
                    <span className="text-white text-[9px] font-bold">EP</span>
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3.5 py-2 text-[14px] leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-[#3797F0] text-white rounded-[20px] rounded-br-[4px]"
                      : "bg-[#EFEFEF] text-gray-900 rounded-[20px] rounded-bl-[4px]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mr-2 mt-auto mb-1">
                  <span className="text-white text-[9px] font-bold">EP</span>
                </div>
                <div className="bg-[#EFEFEF] rounded-[20px] rounded-bl-[4px] px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 3 && (
            <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="shrink-0 rounded-full border border-gray-300 px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Instagram DM Input */}
          <div className="bg-white border-t border-gray-200 px-3 py-2.5">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2.5">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Envoyer un message..."
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                  disabled={isLoading}
                />
                {input.trim() ? (
                  <button type="submit" disabled={isLoading} className="ml-2 text-[#3797F0] font-semibold text-sm">
                    Envoyer
                  </button>
                ) : (
                  <div className="flex items-center gap-3 ml-2">
                    <ImageIcon size={20} className="text-gray-600" />
                    <Heart size={20} className="text-gray-600" />
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="mt-4 text-center">
        <p className="text-sm font-semibold text-gray-700">Démo Instagram DM</p>
        <p className="text-xs text-gray-400 mt-1">Vos clients vous écrivent sur Instagram ? L&apos;assistant répond en 3 secondes.</p>
        <p className="text-[10px] text-gray-300 mt-2">Propulsé par ShopBot AI</p>
      </div>
    </div>
  );
}

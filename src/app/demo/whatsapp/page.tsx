"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Phone, Video, MoreVertical, Send, Paperclip, Mic, Smile } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
}

const QUICK_REPLIES = [
  "Vos tarifs ?",
  "Prendre RDV",
  "Horaires",
  "Coupe femme",
];

function getTime() {
  const now = new Date();
  return now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
}

export default function WhatsAppDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour et bienvenue chez Élégance Paris ! ✨ Comment puis-je vous aider ?",
      time: getTime(),
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

    const userMessage: Message = { role: "user", content: messageText, time: getTime() };
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
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, time: getTime() }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Désolé, une erreur est survenue.", time: getTime() },
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

      {/* Phone frame */}
      <div className="w-full max-w-[420px] bg-black rounded-[2.5rem] p-3 shadow-2xl">
        <div className="rounded-[2rem] overflow-hidden flex flex-col" style={{ height: "700px" }}>

          {/* WhatsApp Header */}
          <div className="bg-[#075E54] px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ArrowLeft size={22} className="text-white" />
                {/* Profile picture */}
                <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">EP</span>
                </div>
                <div>
                  <p className="text-white text-[15px] font-medium leading-tight">Élégance Paris</p>
                  <p className="text-[11px] text-green-200 leading-tight">en ligne</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <Video size={20} className="text-white" />
                <Phone size={18} className="text-white" />
                <MoreVertical size={20} className="text-white" />
              </div>
            </div>
          </div>

          {/* Chat Area with WhatsApp wallpaper */}
          <div
            className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5"
            style={{
              backgroundColor: "#ECE5DD",
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4cfc4' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            {/* Date separator */}
            <div className="flex justify-center mb-2">
              <span className="bg-white/80 text-[11px] text-gray-600 px-3 py-1 rounded-lg shadow-sm">
                Aujourd&apos;hui
              </span>
            </div>

            {/* Business info card */}
            <div className="flex justify-center mb-3">
              <div className="bg-[#FFF3C4] text-[11px] text-gray-700 px-3 py-2 rounded-lg text-center max-w-[280px] shadow-sm">
                <span className="font-medium">Élégance Paris</span> utilise un assistant IA pour répondre à vos messages instantanément.
              </div>
            </div>

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`relative max-w-[80%] px-3 pt-2 pb-1 text-[14px] leading-relaxed whitespace-pre-line shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#DCF8C6] text-gray-900 rounded-lg rounded-tr-none"
                      : "bg-white text-gray-900 rounded-lg rounded-tl-none"
                  }`}
                >
                  {msg.content}
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] text-gray-500">{msg.time}</span>
                    {msg.role === "user" && (
                      <svg className="w-4 h-3 text-[#53BDEB]" viewBox="0 0 16 11" fill="currentColor">
                        <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.339.142.474.474 0 0 0-.142.362c0 .134.047.248.142.343l2.355 2.458a.47.47 0 0 0 .347.153.467.467 0 0 0 .369-.186l6.491-8.048a.48.48 0 0 0 .102-.318.457.457 0 0 0-.103-.37z"/>
                        <path d="M14.331.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.016-1.058-.35.432 1.372 1.428a.47.47 0 0 0 .347.153.467.467 0 0 0 .369-.186l6.491-8.048a.48.48 0 0 0 .102-.318.457.457 0 0 0-.103-.37z" opacity=".3"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
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
            <div className="px-3 py-2 bg-[#ECE5DD] border-t border-gray-300/30 flex gap-2 overflow-x-auto">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="shrink-0 rounded-full border border-[#25D366] bg-white px-3.5 py-1.5 text-xs font-medium text-[#075E54] hover:bg-green-50 transition-colors shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* WhatsApp Input */}
          <div className="bg-[#F0F0F0] px-2 py-2 flex items-center gap-2">
            <div className="flex-1 flex items-center bg-white rounded-full px-3 py-2">
              <Smile size={22} className="text-gray-500 mr-2 shrink-0" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); } }}
                placeholder="Tapez un message"
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                disabled={isLoading}
              />
              <Paperclip size={20} className="text-gray-500 ml-2 shrink-0" />
            </div>
            {input.trim() ? (
              <button
                onClick={() => sendMessage()}
                disabled={isLoading}
                className="w-10 h-10 rounded-full bg-[#075E54] flex items-center justify-center shrink-0"
              >
                <Send size={18} className="text-white ml-0.5" />
              </button>
            ) : (
              <button className="w-10 h-10 rounded-full bg-[#075E54] flex items-center justify-center shrink-0">
                <Mic size={20} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="mt-4 text-center">
        <p className="text-sm font-semibold text-gray-700">Démo WhatsApp Business</p>
        <p className="text-xs text-gray-400 mt-1">Vos clients vous écrivent sur WhatsApp ? L&apos;assistant répond 24h/24.</p>
        <p className="text-[10px] text-gray-300 mt-2">Propulsé par ShopBot AI</p>
      </div>
    </div>
  );
}

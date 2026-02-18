"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ArrowLeft, BarChart3, MessageSquare, TrendingUp, Phone } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "Vos tarifs ?",
  "Prendre RDV",
  "Horaires",
  "Balayage",
];

export default function ProDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour et bienvenue chez Élégance Paris ! ✨ Comment puis-je vous aider aujourd'hui ?",
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/demo" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft size={16} />
            Retour aux offres
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
              PRO — 249€ + 99€/mois
            </span>
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
              POPULAIRE
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Forfait Pro</h1>
          <p className="text-gray-500">Chatbot intelligent multi-canal avec suggestions et statistiques</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat - version Pro enrichie */}
          <div className="lg:col-span-2 flex flex-col rounded-2xl border border-indigo-100 bg-white shadow-xl overflow-hidden" style={{ height: "540px" }}>
            {/* Chat header - Pro avec canaux */}
            <div className="bg-indigo-600 px-5 py-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Bot size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">Élégance Paris</h3>
                <p className="text-xs text-indigo-200">Répond instantanément</p>
              </div>
              {/* Multi-canal indicators */}
              <div className="flex items-center gap-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15" title="Site web">
                  <MessageSquare size={13} className="text-white" />
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15" title="WhatsApp">
                  <Phone size={13} className="text-white" />
                </div>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                      <Bot size={16} className="text-indigo-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-md"
                        : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                      <User size={16} className="text-indigo-600" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                    <Bot size={16} className="text-indigo-600" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-white border border-gray-100 shadow-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-200 animate-bounce" />
                      <span className="h-2 w-2 rounded-full bg-indigo-200 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-indigo-200 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions - Pro feature */}
            {messages.length <= 3 && (
              <div className="px-4 py-2.5 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input - Pro */}
            <div className="border-t border-gray-100 bg-white p-3">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
              <p className="mt-2 text-center text-[10px] text-gray-400">
                Propulsé par ShopBot AI — Forfait Pro
              </p>
            </div>
          </div>

          {/* Side panel - Stats + Features */}
          <div className="space-y-4">
            {/* Mini Stats Dashboard - Pro feature */}
            <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Statistiques</h3>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">PRO</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">247</p>
                  <p className="text-[10px] text-gray-500">Conversations</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                  <p className="text-lg font-bold text-green-600">89%</p>
                  <p className="text-[10px] text-gray-500">Satisfaction</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">3s</p>
                  <p className="text-[10px] text-gray-500">Temps moyen</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                  <p className="text-lg font-bold text-indigo-600">+32</p>
                  <p className="text-[10px] text-gray-500">RDV générés</p>
                </div>
              </div>
              {/* Mini chart */}
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-gray-500">Cette semaine</span>
                  <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                    <TrendingUp size={10} />
                    +18%
                  </span>
                </div>
                <div className="flex items-end gap-1 h-10">
                  {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-indigo-400"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {["L", "M", "M", "J", "V", "S", "D"].map((d) => (
                    <span key={d} className="text-[8px] text-gray-400 flex-1 text-center">{d}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Inclus */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Inclus dans Pro</h3>
              <ul className="space-y-2">
                {[
                  "500 conversations / mois",
                  "2 canaux : Site + WhatsApp",
                  "Suggestions rapides cliquables",
                  "Français + Anglais",
                  "Statistiques de conversations",
                  "Tableau de bord",
                  "Support prioritaire",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-700">
                    <svg className="h-3.5 w-3.5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2">
              <Link href="/demo/starter" className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-center text-xs font-medium text-gray-600 hover:bg-gray-50">
                ← Starter
              </Link>
              <Link href="/demo/business" className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-center text-xs font-semibold text-white hover:bg-indigo-700">
                Business →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

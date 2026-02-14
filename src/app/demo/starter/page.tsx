"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function StarterDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour ! Comment puis-je vous aider ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <Link href="/demo" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft size={16} />
            Retour aux offres
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              STARTER — 149€ + 49€/mois
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Forfait Starter</h1>
          <p className="text-gray-500">Chatbot basique pour votre site web — Réponses texte uniquement</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Chat - prend 3 colonnes */}
          <div className="lg:col-span-3 flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden" style={{ height: "500px" }}>
            {/* Chat header - simple */}
            <div className="bg-gray-800 px-5 py-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-600">
                <Bot size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">Assistant du salon</h3>
                <p className="text-xs text-gray-400">En ligne</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <Bot size={14} className="text-gray-500" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <Bot size={14} className="text-gray-500" />
                  </div>
                  <div className="rounded-xl bg-gray-100 px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" />
                      <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - basique */}
            <div className="border-t border-gray-200 bg-white p-3">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </form>
              <p className="mt-2 text-center text-[10px] text-gray-400">
                Propulsé par ShopBot AI
              </p>
            </div>
          </div>

          {/* Infos Starter - 2 colonnes */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Inclus dans Starter</h3>
              <ul className="space-y-2.5">
                {[
                  "100 conversations / mois",
                  "1 canal : site web uniquement",
                  "Réponses texte simples",
                  "Français uniquement",
                  "Support par email",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Non inclus</h3>
              <ul className="space-y-2.5">
                {[
                  "Instagram & WhatsApp",
                  "Suggestions rapides cliquables",
                  "Statistiques conversations",
                  "Support multilingue",
                  "Personnalisation couleurs",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                    <svg className="h-4 w-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-gray-100 p-4 text-center">
              <p className="text-xs text-gray-500 mb-2">Besoin de plus ?</p>
              <Link href="/demo/pro" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                Voir le forfait Pro →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

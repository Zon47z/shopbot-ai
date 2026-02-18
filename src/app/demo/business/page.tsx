"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ArrowLeft, BarChart3, MessageSquare, TrendingUp, Phone, Globe, Palette, Building2, Shield, Crown, Sparkles } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "Quels sont vos tarifs ?",
  "Prendre rendez-vous",
  "Vos horaires ?",
  "Balayage & coloration",
  "Coupe homme + barbe",
  "Où est le salon ?",
];

const LANGUAGES = [
  { code: "fr", label: "Fran.", flag: "FR" },
  { code: "en", label: "Eng.", flag: "EN" },
  { code: "ar", label: "عربي", flag: "AR" },
  { code: "zh", label: "中文", flag: "ZH" },
];

export default function BusinessDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour et bienvenue chez Élégance Paris ! ✨ Je suis votre assistant personnel. Comment puis-je vous aider aujourd'hui ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState("fr");
  const [brandColor, setBrandColor] = useState("#6366f1");
  const [activeTab, setActiveTab] = useState<"chat" | "analytics" | "settings">("chat");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Header Premium */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/demo" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} />
            Retour aux offres
          </Link>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 px-4 py-1 text-xs font-bold text-amber-400">
              <Crown size={12} />
              BUSINESS — 399€ + 199€/mois
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-xs font-semibold text-amber-400 mb-3">
            <Sparkles size={14} />
            Expérience Premium
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Forfait Business</h1>
          <p className="text-gray-400">Chatbot premium marque blanche — Multi-langue, analytics avancés, personnalisation totale</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar - Dashboard Premium */}
          <div className="lg:col-span-3 space-y-4">
            {/* Tabs */}
            <div className="flex lg:flex-col gap-2">
              {[
                { id: "chat" as const, icon: <MessageSquare size={16} />, label: "Chat" },
                { id: "analytics" as const, icon: <BarChart3 size={16} />, label: "Analytics" },
                { id: "settings" as const, icon: <Palette size={16} />, label: "Branding" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-all flex-1 lg:flex-none ${
                    activeTab === tab.id
                      ? "bg-white/10 text-white border border-white/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Multi-store selector */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={14} className="text-amber-400" />
                <span className="text-xs font-semibold text-white">Multi-boutiques</span>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 ml-auto">BUSINESS</span>
              </div>
              <div className="space-y-1.5">
                {["Élégance Paris 8e", "Élégance Paris 16e", "Élégance Lyon"].map((store, i) => (
                  <button
                    key={store}
                    className={`w-full text-left rounded-lg px-3 py-2 text-xs transition-colors ${
                      i === 0 ? "bg-white/10 text-white" : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                    }`}
                  >
                    {store}
                  </button>
                ))}
              </div>
            </div>

            {/* Canaux connectés */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-xs font-semibold text-white mb-3">Canaux connectés</h3>
              <div className="space-y-2">
                {[
                  { icon: <MessageSquare size={14} />, name: "Site web", status: "Actif", color: "text-green-400" },
                  { icon: <Phone size={14} />, name: "WhatsApp", status: "Actif", color: "text-green-400" },
                  { icon: <Globe size={14} />, name: "API custom", status: "Actif", color: "text-green-400" },
                ].map((c) => (
                  <div key={c.name} className="flex items-center gap-2.5">
                    <span className="text-gray-400">{c.icon}</span>
                    <span className="text-xs text-gray-300 flex-1">{c.name}</span>
                    <span className={`text-[10px] font-medium ${c.color}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features incluses */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-xs font-bold text-white mb-3">Inclus dans Business</h3>
              <ul className="space-y-2">
                {[
                  "Conversations illimitées",
                  "Tous les canaux",
                  "Multi-boutiques",
                  "Marque blanche totale",
                  "Support multilingue auto",
                  "Analytics avancés",
                  "API personnalisée",
                  "Account manager dédié",
                  "SLA 99.9% uptime",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[11px] text-gray-300">
                    <svg className="h-3.5 w-3.5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-9">
            {activeTab === "chat" && (
              <div className="flex flex-col rounded-2xl border border-white/10 bg-white shadow-2xl overflow-hidden" style={{ height: "600px" }}>
                {/* Chat header - Premium customizable */}
                <div className="px-5 py-4 flex items-center gap-3" style={{ backgroundColor: brandColor }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <Bot size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">Élégance Paris</h3>
                    <p className="text-xs text-white/70">Votre assistant personnel</p>
                  </div>
                  {/* Language selector - Business feature */}
                  <div className="flex items-center gap-1 rounded-full bg-white/15 p-1">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setSelectedLang(lang.code)}
                        className={`rounded-full px-2 py-1 text-[10px] font-medium transition-colors ${
                          selectedLang === lang.code
                            ? "bg-white text-gray-900"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        {lang.flag}
                      </button>
                    ))}
                  </div>
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-green-400/30" />
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm" style={{ backgroundColor: `${brandColor}15` }}>
                          <Bot size={18} style={{ color: brandColor }} />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                          msg.role === "user"
                            ? "text-white rounded-br-md shadow-lg"
                            : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md"
                        }`}
                        style={msg.role === "user" ? { backgroundColor: brandColor } : undefined}
                      >
                        {msg.content}
                      </div>
                      {msg.role === "user" && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200">
                          <User size={18} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${brandColor}15` }}>
                        <Bot size={18} style={{ color: brandColor }} />
                      </div>
                      <div className="rounded-2xl rounded-bl-md bg-white border border-gray-100 shadow-sm px-4 py-3">
                        <div className="flex gap-1.5">
                          <span className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: `${brandColor}60`, animationDelay: "0ms" }} />
                          <span className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: `${brandColor}60`, animationDelay: "150ms" }} />
                          <span className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: `${brandColor}60`, animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick suggestions - Premium style */}
                {messages.length <= 3 && (
                  <div className="px-4 py-3 bg-white border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 mb-2 font-medium">Suggestions</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {QUICK_QUESTIONS.map((q) => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q)}
                          className="shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors hover:text-white"
                          style={{ borderColor: `${brandColor}40`, color: brandColor }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = brandColor; e.currentTarget.style.color = "white"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = brandColor; }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input - Premium, no branding (white label) */}
                <div className="border-t border-gray-100 bg-white p-3">
                  <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": `${brandColor}30`, borderColor: input ? brandColor : undefined } as React.CSSProperties}
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white hover:opacity-90 disabled:opacity-40 transition-all"
                      style={{ backgroundColor: brandColor }}
                    >
                      <Send size={18} />
                    </button>
                  </form>
                  {/* No "Propulsé par ShopBot AI" - white label! */}
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Analytics avancés</h3>
                  <div className="flex gap-2">
                    {["7j", "30j", "90j"].map((p, i) => (
                      <button key={p} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${i === 1 ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Conversations", value: "1,247", change: "+23%", up: true },
                    { label: "Taux de satisfaction", value: "94%", change: "+5%", up: true },
                    { label: "RDV générés", value: "186", change: "+31%", up: true },
                    { label: "Temps moyen", value: "2.8s", change: "-0.4s", up: true },
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[10px] text-gray-400 mb-1">{kpi.label}</p>
                      <p className="text-xl font-bold text-white">{kpi.value}</p>
                      <span className="text-[10px] text-green-400 font-medium flex items-center gap-0.5 mt-1">
                        <TrendingUp size={10} />
                        {kpi.change}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <h4 className="text-sm font-semibold text-white mb-3">Conversations / jour</h4>
                    <div className="flex items-end gap-1.5 h-32">
                      {[30, 45, 35, 60, 55, 80, 70, 65, 90, 75, 85, 95, 88, 70, 60, 75, 80, 92, 85, 100, 90, 78, 88, 95, 70, 80, 85, 90, 82, 88].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm transition-all hover:opacity-80"
                          style={{ height: `${h}%`, backgroundColor: `${brandColor}${i > 24 ? "ff" : "80"}` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <h4 className="text-sm font-semibold text-white mb-3">Questions fréquentes</h4>
                    <div className="space-y-3">
                      {[
                        { q: "Tarifs", pct: 35 },
                        { q: "Rendez-vous", pct: 28 },
                        { q: "Horaires", pct: 20 },
                        { q: "Coiffeurs", pct: 10 },
                        { q: "Autre", pct: 7 },
                      ].map((item) => (
                        <div key={item.q}>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-gray-300">{item.q}</span>
                            <span className="text-xs text-gray-400">{item.pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10">
                            <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: brandColor }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Per-channel breakdown */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">Par canal</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: "Site web", icon: <MessageSquare size={16} />, convos: 623, pct: 50 },
                      { name: "WhatsApp", icon: <Phone size={16} />, convos: 545, pct: 44 },
                      { name: "API", icon: <Globe size={16} />, convos: 79, pct: 6 },
                    ].map((ch) => (
                      <div key={ch.name} className="text-center">
                        <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-white/10 text-gray-300 mb-2">
                          {ch.icon}
                        </div>
                        <p className="text-sm font-bold text-white">{ch.convos}</p>
                        <p className="text-[10px] text-gray-400">{ch.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 space-y-6">
                <h3 className="text-lg font-bold text-white">Personnalisation marque blanche</h3>
                <p className="text-sm text-gray-400">Personnalisez les couleurs du chatbot aux couleurs de votre marque. Le logo ShopBot AI disparaît complètement.</p>

                {/* Color picker */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <h4 className="text-sm font-semibold text-white mb-4">Couleur principale</h4>
                  <div className="flex gap-3 flex-wrap">
                    {["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#000000"].map((color) => (
                      <button
                        key={color}
                        onClick={() => setBrandColor(color)}
                        className={`h-10 w-10 rounded-xl transition-transform hover:scale-110 ${brandColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110" : ""}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-gray-400">
                    Couleur active : <code className="bg-white/10 rounded px-1.5 py-0.5">{brandColor}</code> — Retournez sur l&apos;onglet Chat pour voir le résultat
                  </p>
                </div>

                {/* White label preview */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={16} className="text-amber-400" />
                    <h4 className="text-sm font-semibold text-white">Marque blanche</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-white/10 p-3">
                      <p className="text-[10px] text-gray-500 mb-2">Starter / Pro</p>
                      <div className="text-center py-2 text-xs text-gray-400 border-t border-dashed border-gray-700">
                        Propulsé par <span className="font-semibold text-gray-300">ShopBot AI</span>
                      </div>
                      <p className="text-[10px] text-red-400 mt-2 text-center">Logo visible</p>
                    </div>
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                      <p className="text-[10px] text-amber-400 mb-2">Business</p>
                      <div className="text-center py-2 text-xs text-gray-400 border-t border-dashed border-gray-700">
                        Aucun branding externe
                      </div>
                      <p className="text-[10px] text-green-400 mt-2 text-center">100% votre marque</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation between plans */}
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/demo/starter" className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            ← Voir Starter
          </Link>
          <Link href="/demo/pro" className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            ← Voir Pro
          </Link>
        </div>
      </div>
    </div>
  );
}

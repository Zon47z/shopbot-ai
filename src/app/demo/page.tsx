"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Phone, Mic, MicOff, PhoneOff, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Message = {
  role: "assistant" | "user";
  text: string;
};

type ConversationState =
  | "idle"
  | "greeting"
  | "waiting_problem"
  | "clarifying_problem"
  | "waiting_name"
  | "waiting_address"
  | "waiting_phone"
  | "ended";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getAssistantResponse(
  userText: string,
  state: ConversationState,
  context: Record<string, string>
): { response: string; nextState: ConversationState; updatedContext: Record<string, string> } {
  const text = userText.toLowerCase().trim();
  const ctx = { ...context };

  // --- Handle greetings from user (bonjour, salut, etc.) in waiting_problem ---
  if (state === "waiting_problem" && text.length < 20) {
    const isGreeting = /^(bonjour|salut|bonsoir|hey|allo|allô|coucou|oui bonjour|oui|hello)/.test(text);
    if (isGreeting && !text.includes("fuite") && !text.includes("problème") && !text.includes("panne")) {
      return {
        response: pick([
          "Oui bonjour ! Dites-moi, qu'est-ce qui se passe chez vous ?",
          "Bonjour ! Comment je peux vous aider ?",
          "Oui, dites-moi tout, qu'est-ce qu'il y a ?",
        ]),
        nextState: "waiting_problem",
        updatedContext: ctx,
      };
    }
  }

  // --- Handle price questions in any state ---
  if (
    text.includes("combien") ||
    text.includes("prix") ||
    text.includes("tarif") ||
    text.includes("coût") ||
    text.includes("devis") ||
    text.includes("cher")
  ) {
    const alreadyHasName = !!ctx.name;
    return {
      response: pick([
        `Alors pour les tarifs, c'est Martin qui gère ça directement. Il préfère toujours voir sur place avant de donner un chiffre, comme ça pas de mauvaise surprise pour vous. ${alreadyHasName ? "Il vous rappelle très vite pour en discuter." : "Si vous me donnez votre nom, je lui transmets et il vous rappelle pour en parler."}`,
        `Bonne question ! Honnêtement, ça dépend vraiment de la situation, c'est pour ça que Martin préfère se déplacer et voir avant de vous donner un prix. ${alreadyHasName ? "Il va vous recontacter rapidement." : "Donnez-moi votre nom et il vous rappelle pour ça."}`,
      ]),
      nextState: alreadyHasName ? "waiting_address" : "waiting_name",
      updatedContext: ctx,
    };
  }

  // --- Handle "quand" / availability questions ---
  if (
    text.includes("quand") ||
    text.includes("disponible") ||
    text.includes("venir quand") ||
    text.includes("rapidement") ||
    text.includes("aujourd'hui") ||
    text.includes("maintenant")
  ) {
    return {
      response: pick([
        "Martin est sur un chantier là, mais il est assez réactif d'habitude. Dès qu'il a votre message, il vous rappelle pour caler ça avec vous. On prend vos coordonnées ?",
        "Écoutez, Martin gère son planning, mais il rappelle en général dans l'heure. Donnez-moi vos infos et il vous recontacte dès qu'il est dispo.",
      ]),
      nextState: ctx.name ? "waiting_address" : "waiting_name",
      updatedContext: ctx,
    };
  }

  switch (state) {
    case "waiting_problem": {
      if (text.length < 3) {
        return {
          response: "Pardon, j'ai pas bien entendu. Vous pouvez me répéter ?",
          nextState: "waiting_problem",
          updatedContext: ctx,
        };
      }

      // --- Detect problem type ---
      let problemType = "";
      let empathy = "";
      let tip = "";

      if (text.includes("fuite") || text.includes("coule") || text.includes("goutte") || text.includes("inond")) {
        problemType = "une fuite";
        if (text.includes("évier") || text.includes("cuisine")) problemType = "une fuite sous l'évier";
        else if (text.includes("salle de bain") || text.includes("douche")) problemType = "une fuite dans la salle de bain";
        else if (text.includes("plafond")) problemType = "une fuite au plafond";
        empathy = pick([
          "Aïe, c'est pas top ça.",
          "Oh mince, c'est embêtant.",
          "D'accord, c'est le genre de truc qu'il faut pas laisser traîner.",
        ]);
        tip = text.includes("inond") || text.includes("partout") || text.includes("beaucoup")
          ? " En attendant Martin, essayez de couper l'arrivée d'eau si vous pouvez, hein, pour limiter les dégâts."
          : "";
      } else if (text.includes("bouché") || text.includes("bouchée") || text.includes("canalisation") || text.includes("refoul")) {
        problemType = "une canalisation bouchée";
        if (text.includes("évier")) problemType = "un évier bouché";
        else if (text.includes("toilette") || text.includes("wc")) problemType = "des toilettes bouchées";
        else if (text.includes("douche") || text.includes("baignoire")) problemType = "une douche qui s'évacue plus";
        empathy = pick([
          "Ah oui, c'est pas agréable du tout.",
          "OK je vois, c'est le genre de truc qui attend pas.",
        ]);
      } else if (text.includes("chauffe-eau") || text.includes("chauffe eau") || text.includes("eau chaude") || text.includes("ballon") || text.includes("cumulus")) {
        problemType = "un souci de chauffe-eau";
        empathy = pick([
          "Ah oui, pas d'eau chaude c'est vraiment galère.",
          "Je comprends, c'est pas le genre de truc qu'on peut repousser.",
        ]);
      } else if (text.includes("chasse") || text.includes("wc") || text.includes("toilette")) {
        problemType = "un problème de toilettes";
        empathy = pick([
          "OK, c'est embêtant ça.",
          "D'accord, pas idéal.",
        ]);
      } else if (text.includes("radiateur") || text.includes("chauffage") || text.includes("chaudière")) {
        problemType = "un problème de chauffage";
        empathy = pick([
          "Ah, surtout en ce moment c'est pas le moment de pas avoir de chauffage.",
          "Oui, c'est pas drôle ça.",
        ]);
      } else if (text.includes("robinet") || text.includes("mitigeur")) {
        problemType = "un souci de robinet";
        empathy = pick([
          "OK, je vois.",
          "D'accord.",
        ]);
      } else if (text.includes("tuyau") || text.includes("raccord")) {
        problemType = "un problème de tuyauterie";
        empathy = "D'accord, je note.";
      } else {
        // Generic problem - still sounds natural
        problemType = "";
        empathy = "OK, je vois.";
      }

      const isUrgent = text.includes("urgent") || text.includes("inond") || text.includes("partout") || text.includes("catastrophe") || text.includes("dégât") || text.includes("vite");
      if (isUrgent) ctx.urgency = "urgent";

      if (problemType) {
        ctx.problem = problemType;
      } else {
        ctx.problem = userText;
      }

      const response = `${empathy}${tip} ${pick([
        "Je vais transmettre tout ça à Martin. C'est à quel nom ?",
        "OK, je note ça pour Martin. Vous vous appelez comment ?",
        "Martin va s'occuper de ça. Donnez-moi votre nom, je lui transmets.",
      ])}`;

      return {
        response: response.trim(),
        nextState: "waiting_name",
        updatedContext: ctx,
      };
    }

    case "clarifying_problem": {
      ctx.problem = userText;
      return {
        response: pick([
          "OK c'est noté. Et c'est à quel nom ?",
          "D'accord, je transmets ça. Vous vous appelez comment ?",
        ]),
        nextState: "waiting_name",
        updatedContext: ctx,
      };
    }

    case "waiting_name": {
      if (text.length < 2) {
        return {
          response: "Pardon, j'ai pas bien capté votre nom. Vous pouvez me le répéter ?",
          nextState: "waiting_name",
          updatedContext: ctx,
        };
      }

      // Clean up common speech artifacts
      let name = userText
        .replace(/^(je m'appelle |c'est |moi c'est |mon nom c'est |oui |alors )/i, "")
        .trim();

      // Capitalize
      name = name
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

      ctx.name = name;

      return {
        response: pick([
          `${name}, OK c'est noté. Et vous êtes où ? C'est quoi l'adresse pour l'intervention ?`,
          `Très bien ${name}. Et c'est à quelle adresse chez vous ?`,
          `OK ${name}. Vous habitez où exactement, que je note l'adresse pour Martin ?`,
        ]),
        nextState: "waiting_address",
        updatedContext: ctx,
      };
    }

    case "waiting_address": {
      if (text.length < 3) {
        return {
          response: "J'ai pas bien entendu l'adresse. Vous pouvez me la redonner ?",
          nextState: "waiting_address",
          updatedContext: ctx,
        };
      }

      let address = userText
        .replace(/^(c'est le |c'est au |au |j'habite |j'habite au |je suis au )/i, "")
        .trim();
      ctx.address = address;

      return {
        response: pick([
          `OK, ${address}. Et le meilleur numéro pour vous rappeler, c'est celui-ci ou vous en avez un autre ?`,
          `C'est noté. À quel numéro Martin peut vous joindre ?`,
          `Parfait. Et il vous rappelle à quel numéro ? Celui-là ou un autre ?`,
        ]),
        nextState: "waiting_phone",
        updatedContext: ctx,
      };
    }

    case "waiting_phone": {
      // Handle "celui-ci" / "oui" / "le même" type answers
      if (text.includes("celui") || text.includes("même") || text.includes("oui") || text.includes("ce numéro")) {
        ctx.phone = "ce numéro";
      } else {
        ctx.phone = userText;
      }

      const urgencyMsg = ctx.urgency === "urgent"
        ? " Vu que c'est urgent, il va vous rappeler en priorité."
        : "";

      const tipMsg = ctx.urgency === "urgent" && (ctx.problem?.includes("fuite") || ctx.problem?.includes("eau"))
        ? " Et pensez à couper l'eau en attendant, hein."
        : "";

      return {
        response: pick([
          `Super, j'ai tout noté. Donc ${ctx.name}, ${ctx.problem}, au ${ctx.address}. Martin vous rappelle dès qu'il sort du chantier.${urgencyMsg}${tipMsg} Bonne journée !`,
          `C'est parfait, je transmets tout à Martin. ${ctx.name}, ${ctx.problem}, ${ctx.address}. Il vous recontacte très vite.${urgencyMsg}${tipMsg} Bonne journée à vous !`,
          `OK c'est bon pour moi. Je résume : ${ctx.name}, ${ctx.problem}, ${ctx.address}. Martin va vous rappeler.${urgencyMsg}${tipMsg} Passez une bonne journée !`,
        ]),
        nextState: "ended",
        updatedContext: ctx,
      };
    }

    case "ended": {
      return {
        response: pick([
          "C'est tout bon, Martin va vous rappeler. Bonne journée !",
          "C'est noté, il vous recontacte bientôt. Au revoir !",
        ]),
        nextState: "ended",
        updatedContext: ctx,
      };
    }

    default: {
      ctx.problem = userText;
      return {
        response: `OK je vois. Je transmets ça à Martin. C'est à quel nom ?`,
        nextState: "waiting_name",
        updatedContext: ctx,
      };
    }
  }
}

export default function VoiceDemo() {
  const [callActive, setCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Use refs for conversation state to avoid stale closures
  const stateRef = useRef<ConversationState>("idle");
  const contextRef = useRef<Record<string, string>>({});
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load voices on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.95; // Slightly slower = more natural
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    // Prefer Google French voice (most natural), then any French voice
    const frenchVoice =
      voices.find((v) => v.lang.startsWith("fr") && v.name.toLowerCase().includes("google")) ||
      voices.find((v) => v.lang === "fr-FR") ||
      voices.find((v) => v.lang.startsWith("fr"));
    if (frenchVoice) utterance.voice = frenchVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionAPI =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    const recognition = new (SpeechRecognitionAPI as new () => SpeechRecognitionInstance)();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setCurrentTranscript(transcript);

      if (event.results[event.results.length - 1].isFinal) {
        setCurrentTranscript("");
        setIsListening(false);

        const userMessage: Message = { role: "user", text: transcript };
        setMessages((prev) => [...prev, userMessage]);
        scrollToBottom();

        // Use refs to get current state (no stale closures)
        const { response, nextState, updatedContext } = getAssistantResponse(
          transcript,
          stateRef.current,
          contextRef.current
        );

        // Update refs immediately
        stateRef.current = nextState;
        contextRef.current = updatedContext;

        const assistantMessage: Message = { role: "assistant", text: response };
        setMessages((prev) => [...prev, assistantMessage]);
        scrollToBottom();

        speak(response, () => {
          if (nextState !== "ended") {
            setTimeout(() => startListening(), 400);
          }
        });
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setCurrentTranscript("");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [speak, scrollToBottom]);

  const startCall = useCallback(() => {
    setCallActive(true);
    setMessages([]);
    stateRef.current = "greeting";
    contextRef.current = {};

    const greeting = pick([
      "Bonjour, Martin Plomberie ! Martin est sur un chantier là, mais je peux prendre votre demande. Qu'est-ce qui se passe ?",
      "Allô, Martin Plomberie bonjour ! Martin est pas disponible pour le moment, je suis son assistant. Dites-moi, c'est pour quoi ?",
      "Oui bonjour, Martin Plomberie ! Martin est en intervention, mais dites-moi ce qu'il vous arrive, je lui transmets.",
    ]);

    const assistantMessage: Message = { role: "assistant", text: greeting };
    setMessages([assistantMessage]);

    speak(greeting, () => {
      stateRef.current = "waiting_problem";
      startListening();
    });
  }, [speak, startListening]);

  const endCall = useCallback(() => {
    setCallActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentTranscript("");
    stateRef.current = "idle";
    contextRef.current = {};
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    window.speechSynthesis?.cancel();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Phone size={20} />
            </div>
            <span className="text-lg font-bold text-gray-900">AlloPro AI</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft size={16} />
            Retour
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Démo — Martin Plomberie
          </h1>
          <p className="text-gray-600">
            Parlez comme si vous appeliez un plombier. Dites votre problème, l&apos;assistant gère le reste.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Fonctionne sur Chrome. Autorisez le micro quand demandé.
          </p>
        </div>

        {/* Phone UI */}
        <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl max-w-md mx-auto">
          {/* Call header */}
          <div className="text-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 mx-auto mb-3">
              <Phone size={28} className={`text-emerald-400 ${callActive ? "animate-pulse" : ""}`} />
            </div>
            <p className="text-white font-semibold text-lg">Martin Plomberie</p>
            <p className="text-gray-400 text-sm">
              {!callActive
                ? "Appuyez pour appeler"
                : isSpeaking
                  ? "L'assistant parle..."
                  : isListening
                    ? "À vous de parler..."
                    : "En ligne"}
            </p>
          </div>

          {/* Messages */}
          {callActive && (
            <div className="bg-gray-800 rounded-2xl p-4 mb-6 h-72 overflow-y-auto">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}
                >
                  <div className={`inline-block px-3 py-2 rounded-2xl text-sm max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-700 text-gray-200"
                  }`}>
                    {msg.role === "assistant" && (
                      <span className="text-emerald-400 text-xs block mb-1">Assistant</span>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}
              {currentTranscript && (
                <div className="mb-3 text-right">
                  <div className="inline-block px-3 py-2 rounded-2xl text-sm bg-emerald-600/40 text-white/70 max-w-[85%]">
                    {currentTranscript}...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Call buttons */}
          <div className="flex justify-center gap-6">
            {!callActive ? (
              <button
                onClick={startCall}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/30 active:scale-95"
              >
                <Phone size={28} className="text-white" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (isListening) {
                      try { recognitionRef.current?.stop(); } catch {}
                      setIsListening(false);
                    } else if (!isSpeaking) {
                      startListening();
                    }
                  }}
                  disabled={isSpeaking}
                  className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
                    isListening
                      ? "bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/30"
                      : isSpeaking
                        ? "bg-gray-800 cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {isListening ? <Mic size={24} className="text-white" /> : <MicOff size={24} className="text-gray-300" />}
                </button>
                <button
                  onClick={endCall}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 hover:bg-red-400 transition-colors active:scale-95"
                >
                  <PhoneOff size={24} className="text-white" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Essayez de dire :</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              &quot;J&apos;ai une fuite sous mon évier, ça coule partout&quot;
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              &quot;Mon chauffe-eau marche plus, j&apos;ai pas d&apos;eau chaude depuis ce matin&quot;
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              &quot;C&apos;est combien un dépannage ?&quot;
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              &quot;Mes toilettes sont bouchées, c&apos;est urgent&quot;
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Vous êtes artisan ? Imaginez ça avec le nom de votre entreprise.
          </p>
          <a
            href="mailto:shopbot.ai.pro@gmail.com?subject=AlloPro AI — Je veux tester"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            Je veux ça pour mon entreprise
          </a>
        </div>
      </div>
    </div>
  );
}

// Type declarations for Web Speech API
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
}

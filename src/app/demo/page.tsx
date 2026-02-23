"use client";

import { useState, useRef, useCallback } from "react";
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
  | "waiting_name"
  | "waiting_address"
  | "waiting_phone"
  | "confirming"
  | "ended";

function getAssistantResponse(
  userText: string,
  state: ConversationState,
  context: Record<string, string>
): { response: string; nextState: ConversationState; updatedContext: Record<string, string> } {
  const text = userText.toLowerCase().trim();
  const ctx = { ...context };

  // Handle price questions in any state
  if (
    text.includes("combien") ||
    text.includes("prix") ||
    text.includes("tarif") ||
    text.includes("coût") ||
    text.includes("devis")
  ) {
    return {
      response:
        "Martin préfère se déplacer et voir la situation avant de vous donner un tarif précis. Il vous rappellera avec un devis adapté. Quel est votre nom pour que je lui transmette ?",
      nextState: "waiting_name",
      updatedContext: ctx,
    };
  }

  switch (state) {
    case "waiting_problem": {
      // Try to detect the type of problem
      if (text.length < 3) {
        return {
          response: "Excusez-moi, je n'ai pas bien compris. Pouvez-vous me décrire votre problème ?",
          nextState: "waiting_problem",
          updatedContext: ctx,
        };
      }

      let problemType = "un problème";
      if (text.includes("fuite") || text.includes("eau") || text.includes("coule") || text.includes("inond")) {
        problemType = "une fuite d'eau";
      } else if (text.includes("bouché") || text.includes("bouchée") || text.includes("évier") || text.includes("canalisation")) {
        problemType = "une canalisation bouchée";
      } else if (text.includes("chauffe") || text.includes("chaude") || text.includes("ballon") || text.includes("cumulus")) {
        problemType = "un problème de chauffe-eau";
      } else if (text.includes("chasse") || text.includes("wc") || text.includes("toilette")) {
        problemType = "un problème de chasse d'eau";
      } else if (text.includes("radiateur") || text.includes("chauffage") || text.includes("chaudière")) {
        problemType = "un problème de chauffage";
      } else if (text.includes("robinet") || text.includes("mitigeur")) {
        problemType = "un problème de robinet";
      }

      ctx.problem = problemType;

      // Check urgency
      const isUrgent = text.includes("urgent") || text.includes("inond") || text.includes("partout") || text.includes("vite") || text.includes("tout de suite");

      let response = `D'accord, je note ${problemType}. `;
      if (isUrgent) {
        ctx.urgency = "urgent";
        response += "Je comprends que c'est urgent. Si possible, coupez l'arrivée d'eau en attendant. Martin va vous rappeler en priorité. ";
      }
      response += "Quel est votre nom, s'il vous plaît ?";

      return {
        response,
        nextState: "waiting_name",
        updatedContext: ctx,
      };
    }

    case "waiting_name": {
      if (text.length < 2) {
        return {
          response: "Excusez-moi, pouvez-vous me répéter votre nom ?",
          nextState: "waiting_name",
          updatedContext: ctx,
        };
      }

      // Capitalize first letter of each word
      ctx.name = userText
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

      return {
        response: `Merci ${ctx.name}. Et quelle est votre adresse pour l'intervention ?`,
        nextState: "waiting_address",
        updatedContext: ctx,
      };
    }

    case "waiting_address": {
      if (text.length < 5) {
        return {
          response: "Pouvez-vous me donner votre adresse complète, s'il vous plaît ?",
          nextState: "waiting_address",
          updatedContext: ctx,
        };
      }

      ctx.address = userText;

      return {
        response: `Très bien. Et à quel numéro Martin peut-il vous rappeler ?`,
        nextState: "waiting_phone",
        updatedContext: ctx,
      };
    }

    case "waiting_phone": {
      ctx.phone = userText;

      const urgencyText = ctx.urgency === "urgent" ? " en priorité" : " dans les plus brefs délais";

      return {
        response: `Parfait, j'ai bien tout noté. ${ctx.name}, ${ctx.problem}, au ${ctx.address}. Martin va vous rappeler${urgencyText} au ${ctx.phone}. ${ctx.urgency === "urgent" ? "En attendant, pensez bien à couper l'arrivée d'eau si c'est possible. " : ""}Bonne journée !`,
        nextState: "ended",
        updatedContext: ctx,
      };
    }

    case "confirming":
    case "ended": {
      return {
        response: "Merci pour votre appel. Martin va vous rappeler très vite. Bonne journée !",
        nextState: "ended",
        updatedContext: ctx,
      };
    }

    default: {
      ctx.problem = userText;
      return {
        response: `D'accord, je note votre demande. Quel est votre nom, s'il vous plaît ?`,
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
  const [conversationState, setConversationState] = useState<ConversationState>("idle");
  const [context, setContext] = useState<Record<string, string>>({});
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to find a French voice
    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find(
      (v) => v.lang.startsWith("fr") && v.name.toLowerCase().includes("google")
    ) || voices.find((v) => v.lang.startsWith("fr"));
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

    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new (SpeechRecognition as new () => SpeechRecognitionInstance)();
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

        // Get AI response
        setConversationState((prevState) => {
          setContext((prevContext) => {
            const { response, nextState, updatedContext } = getAssistantResponse(
              transcript,
              prevState,
              prevContext
            );

            const assistantMessage: Message = { role: "assistant", text: response };
            setMessages((prev) => [...prev, assistantMessage]);
            scrollToBottom();

            speak(response, () => {
              if (nextState !== "ended") {
                setTimeout(() => startListening(), 500);
              }
            });

            setContext(updatedContext);
            return updatedContext;
          });
          return prevState;
        });

        return "waiting_problem" as ConversationState;
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
    setConversationState("greeting");
    setContext({});

    const greeting =
      "Bonjour, vous êtes bien chez Martin Plomberie ! Martin est actuellement sur un chantier, mais je suis son assistant. Comment puis-je vous aider ?";

    const assistantMessage: Message = { role: "assistant", text: greeting };
    setMessages([assistantMessage]);

    speak(greeting, () => {
      setConversationState("waiting_problem");
      startListening();
    });
  }, [speak, startListening]);

  const endCall = useCallback(() => {
    setCallActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentTranscript("");
    setConversationState("idle");
    if (recognitionRef.current) {
      recognitionRef.current.stop();
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
            Parlez à l&apos;assistant comme si vous étiez un client avec un problème de plomberie.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Utilisez Chrome pour une meilleure expérience vocale.
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
                    : "En communication"}
            </p>
          </div>

          {/* Messages */}
          {callActive && (
            <div className="bg-gray-800 rounded-2xl p-4 mb-6 h-64 overflow-y-auto">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}
                >
                  <span
                    className={`inline-block px-3 py-2 rounded-2xl text-sm max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-700 text-gray-200"
                    }`}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
              {currentTranscript && (
                <div className="mb-3 text-right">
                  <span className="inline-block px-3 py-2 rounded-2xl text-sm bg-emerald-600/50 text-white/70 max-w-[85%]">
                    {currentTranscript}...
                  </span>
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
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/30"
              >
                <Phone size={28} className="text-white" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (isListening) {
                      recognitionRef.current?.stop();
                      setIsListening(false);
                    } else {
                      startListening();
                    }
                  }}
                  className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
                    isListening
                      ? "bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/30"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {isListening ? <Mic size={24} className="text-white" /> : <MicOff size={24} className="text-gray-300" />}
                </button>
                <button
                  onClick={endCall}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 hover:bg-red-400 transition-colors"
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
              &quot;Bonjour, j&apos;ai une fuite sous mon évier&quot;
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              &quot;Mon chauffe-eau ne marche plus&quot;
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              &quot;C&apos;est combien un dépannage ?&quot;
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              &quot;J&apos;ai mes toilettes bouchées, c&apos;est urgent&quot;
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Vous êtes artisan ? Imaginez ça avec votre nom et votre métier.
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

function createRecognition(): SpeechRecognitionInstance {
  return null as unknown as SpeechRecognitionInstance;
}

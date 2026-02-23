"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Phone, Mic, MicOff, PhoneOff, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";

type Message = {
  role: "assistant" | "user";
  text: string;
};

type ConversationState =
  | "idle"
  | "greeting"
  | "waiting_problem"
  | "followup_problem"
  | "waiting_name"
  | "waiting_address"
  | "waiting_phone"
  | "ended";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- CORE AI LOGIC ---

function getAssistantResponse(
  userText: string,
  state: ConversationState,
  context: Record<string, string>
): { response: string; nextState: ConversationState; updatedContext: Record<string, string> } {
  const text = userText.toLowerCase().trim();
  const ctx = { ...context };

  // === GLOBAL HANDLERS (any state) ===

  // Handle greetings in waiting_problem
  if (state === "waiting_problem") {
    const justGreeting = /^(bonjour|salut|bonsoir|hey|allo|allô|coucou|oui bonjour|oui|hello|bonsoir)[\s!.,?]*$/i.test(text);
    if (justGreeting) {
      return {
        response: pick([
          "Oui bonjour ! Alors, dites-moi, qu'est-ce qui vous arrive ?",
          "Bonjour ! Qu'est-ce qui se passe chez vous ?",
          "Bonjour, bonjour ! Allez-y, dites-moi tout.",
        ]),
        nextState: "waiting_problem",
        updatedContext: ctx,
      };
    }
  }

  // Price questions
  if (text.includes("combien") || text.includes("prix") || text.includes("tarif") || text.includes("coût") || text.includes("devis") || text.includes("cher")) {
    const hasName = !!ctx.name;
    return {
      response: pick([
        `Ah, pour les tarifs, honnêtement, Martin il préfère toujours se déplacer, voir ce qu'il en est, et après il vous donne un prix juste. Comme ça y'a pas de mauvaise surprise. ${hasName ? "Il va vous rappeler pour en discuter." : "Si vous me donnez votre petit nom, je lui fais passer et il vous rappelle."}`,
        `Bonne question. Alors, Martin il donne jamais de prix comme ça au téléphone, parce que ça dépend vraiment de la situation. Il préfère voir sur place. ${hasName ? "Il vous recontacte rapidement." : "Donnez-moi juste votre nom, il vous rappelle pour ça."}`,
        `Écoutez, les prix c'est vraiment au cas par cas. Martin il aime bien voir de ses yeux avant de s'avancer sur un chiffre. ${hasName ? "Il va vous rappeler très vite." : "Votre nom et il vous rappelle pour ça."}`,
      ]),
      nextState: hasName ? "waiting_address" : "waiting_name",
      updatedContext: ctx,
    };
  }

  // Availability / timing questions
  if (text.includes("quand") || text.includes("disponible") || text.includes("venir") || text.includes("rapidement") || text.includes("aujourd") || text.includes("maintenant") || text.includes("ce soir") || text.includes("demain")) {
    return {
      response: pick([
        "Alors, Martin il est sur un chantier là, mais en général il rappelle dans l'heure hein. Dès qu'il a fini il vous contacte. On prend vos coordonnées comme ça c'est fait ?",
        "Il est en intervention pour le moment mais il est réactif, vous inquiétez pas. Donnez-moi vos infos et dès qu'il est libre il vous rappelle.",
        "Là il est occupé, mais c'est quelqu'un de rapide. Donnez-moi votre nom et votre adresse, et il vous recontacte dès que possible.",
      ]),
      nextState: ctx.name ? "waiting_address" : "waiting_name",
      updatedContext: ctx,
    };
  }

  // Handle ended state or polite endings
  if (state === "ended") {
    return {
      response: pick([
        "De rien ! Martin vous rappelle bientôt. Bonne journée !",
        "Y'a pas de quoi. Allez, bonne journée, Martin va vous recontacter !",
        "C'est tout bon, Martin va vous rappeler. Au revoir !",
      ]),
      nextState: "ended",
      updatedContext: ctx,
    };
  }

  // === STATE-SPECIFIC HANDLERS ===

  switch (state) {
    case "waiting_problem": {
      if (text.length < 3) {
        return {
          response: "Pardon, j'ai pas bien entendu. Vous pouvez me répéter ça ?",
          nextState: "waiting_problem",
          updatedContext: ctx,
        };
      }

      // --- Detect problem ---
      let problemType = "";
      let empathy = "";
      let followUp = "";
      let needsFollowUp = false;

      if (text.includes("fuite") || text.includes("coule") || text.includes("goutte") || text.includes("inond") || text.includes("eau")) {
        if (text.includes("évier") || text.includes("cuisine")) {
          problemType = "une fuite sous l'évier";
        } else if (text.includes("salle de bain") || text.includes("douche")) {
          problemType = "une fuite dans la salle de bain";
        } else if (text.includes("plafond")) {
          problemType = "une fuite au plafond";
        } else if (text.includes("wc") || text.includes("toilette")) {
          problemType = "une fuite au niveau des toilettes";
        } else {
          problemType = "une fuite";
          if (!text.includes("évier") && !text.includes("cuisine") && !text.includes("salle") && text.length < 40) {
            needsFollowUp = true;
            followUp = "C'est où exactement la fuite ? Cuisine, salle de bain ?";
          }
        }
        empathy = pick([
          "Aïe. Bon, c'est le genre de truc qui attend pas.",
          "Oh là là, une fuite c'est jamais agréable.",
          "Mince. Oui non, ça faut s'en occuper.",
        ]);
      } else if (text.includes("bouché") || text.includes("bouchée") || text.includes("canalisation") || text.includes("refoul") || text.includes("évacue")) {
        if (text.includes("évier")) problemType = "un évier bouché";
        else if (text.includes("toilette") || text.includes("wc")) problemType = "des WC bouchés";
        else if (text.includes("douche") || text.includes("baignoire")) problemType = "une douche qui s'évacue plus";
        else problemType = "une canalisation bouchée";
        empathy = pick([
          "Ah oui, bon, c'est pas le plus fun mais Martin gère ça très bien.",
          "OK, c'est embêtant mais c'est du classique, Martin fait ça tous les jours.",
        ]);
      } else if (text.includes("chauffe-eau") || text.includes("chauffe eau") || text.includes("eau chaude") || text.includes("ballon") || text.includes("cumulus")) {
        problemType = "une panne de chauffe-eau";
        empathy = pick([
          "Ouais, pas d'eau chaude, c'est vraiment la galère, surtout le matin.",
          "Ah oui, ça c'est pénible. Bon, Martin va regarder ça.",
        ]);
        if (!text.includes("depuis") && text.length < 30) {
          needsFollowUp = true;
          followUp = "C'est depuis quand ? Ce matin ou ça fait quelques jours ?";
        }
      } else if (text.includes("chasse") || text.includes("wc") || text.includes("toilette")) {
        problemType = "un problème de toilettes";
        empathy = pick([
          "OK, oui, les toilettes c'est prioritaire évidemment.",
          "Bon, ça c'est le genre de truc qui peut pas attendre, je comprends.",
        ]);
      } else if (text.includes("radiateur") || text.includes("chauffage") || text.includes("chaudière")) {
        problemType = "un problème de chauffage";
        empathy = pick([
          "Ah, le chauffage qui lâche, c'est pas le moment.",
          "Oui, bon, sans chauffage c'est compliqué.",
        ]);
      } else if (text.includes("robinet") || text.includes("mitigeur")) {
        problemType = "un souci de robinet";
        empathy = pick(["OK, je vois.", "D'accord, oui."]);
      } else if (text.includes("tuyau") || text.includes("raccord") || text.includes("soudure")) {
        problemType = "un problème de tuyauterie";
        empathy = "D'accord, je note.";
      } else {
        // Unknown problem - ask for clarification naturally
        problemType = userText;
        empathy = pick([
          "OK.",
          "D'accord.",
          "Oui, je vois.",
        ]);
      }

      ctx.problem = problemType;

      // Check urgency
      const isUrgent = text.includes("urgent") || text.includes("inond") || text.includes("partout") || text.includes("catastrophe") || text.includes("dégât") || text.includes("vite") || text.includes("secours") || text.includes("déborde");
      if (isUrgent) {
        ctx.urgency = "urgent";
        empathy = pick([
          "Oh là, oui c'est urgent là.",
          "OK, oui, là faut agir vite.",
          "D'accord, c'est une urgence.",
        ]);
      }

      // If we need follow-up about the problem
      if (needsFollowUp && !isUrgent) {
        return {
          response: `${empathy} ${followUp}`,
          nextState: "followup_problem",
          updatedContext: ctx,
        };
      }

      // Emergency tip
      const tip = isUrgent && (text.includes("fuite") || text.includes("eau") || text.includes("inond") || text.includes("coule"))
        ? " Si vous pouvez, coupez l'arrivée d'eau en attendant, ça limitera les dégâts."
        : "";

      return {
        response: `${empathy}${tip} ${pick([
          "Bon, je transmets tout ça à Martin. C'est à quel nom ?",
          "OK. Alors, votre nom, que je puisse noter ça pour Martin ?",
          "Martin va s'en occuper. Dites-moi, vous vous appelez comment ?",
          "Je note ça. Et c'est à quel nom ?",
        ])}`,
        nextState: "waiting_name",
        updatedContext: ctx,
      };
    }

    case "followup_problem": {
      // User is giving more details about the problem
      const prevProblem = ctx.problem || "";
      if (text.includes("cuisine")) ctx.problem = prevProblem.replace("une fuite", "une fuite en cuisine");
      else if (text.includes("salle de bain") || text.includes("douche")) ctx.problem = prevProblem.replace("une fuite", "une fuite dans la salle de bain");
      else if (text.includes("matin") || text.includes("hier") || text.includes("depuis")) ctx.problem = `${prevProblem}, depuis ${text.includes("matin") ? "ce matin" : text.includes("hier") ? "hier" : "quelques jours"}`;
      else ctx.problem = `${prevProblem}, ${userText}`;

      return {
        response: pick([
          `OK, c'est plus clair. Bon, Martin va gérer ça. C'est à quel nom ?`,
          `D'accord, je note tout. Et vous, c'est quoi votre petit nom ?`,
          `Très bien. Alors, pour que Martin vous rappelle, c'est à quel nom ?`,
        ]),
        nextState: "waiting_name",
        updatedContext: ctx,
      };
    }

    case "waiting_name": {
      if (text.length < 2) {
        return {
          response: pick([
            "Pardon, j'ai pas capté. Votre nom c'est ?",
            "Excusez-moi, vous pouvez répéter votre nom ?",
          ]),
          nextState: "waiting_name",
          updatedContext: ctx,
        };
      }

      // Clean up speech artifacts
      let name = userText
        .replace(/^(euh |alors |bon |je m'appelle |c'est |moi c'est |mon nom c'est |oui |oui c'est |donc )/i, "")
        .replace(/[.,!?]+$/, "")
        .trim();

      name = name.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      ctx.name = name;

      return {
        response: pick([
          `${name}. OK, c'est noté. Et vous êtes où, c'est quoi l'adresse pour que Martin puisse venir ?`,
          `D'accord ${name}. Et l'adresse du domicile, c'est quoi ?`,
          `Très bien ${name}. Alors, l'adresse pour l'intervention ?`,
          `OK ${name}, parfait. Et vous habitez où exactement ?`,
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

      const address = userText
        .replace(/^(c'est le |c'est au |au |j'habite |j'habite au |je suis au |alors |euh |bon )/i, "")
        .replace(/[.,!?]+$/, "")
        .trim();
      ctx.address = address;

      return {
        response: pick([
          `OK, ${address}. Et, dernier truc, le meilleur numéro pour que Martin vous rappelle, c'est celui-ci ou vous en avez un autre ?`,
          `C'est noté. Et à quel numéro Martin peut vous joindre ? C'est le bon celui-là ou y'en a un autre ?`,
          `Parfait, ${address}. Et le numéro de rappel, c'est celui-ci ou c'est un autre ?`,
        ]),
        nextState: "waiting_phone",
        updatedContext: ctx,
      };
    }

    case "waiting_phone": {
      if (text.includes("celui") || text.includes("même") || text.includes("oui") || text.includes("ce numéro") || text.includes("c'est bon") || text.includes("celui-là") || text.includes("ouais")) {
        ctx.phone = "ce numéro";
      } else {
        ctx.phone = userText;
      }

      const isUrgent = ctx.urgency === "urgent";

      const recap = `Alors je récapitule : ${ctx.name}, ${ctx.problem}, au ${ctx.address}.`;
      const callback = isUrgent
        ? " Vu que c'est urgent, Martin va vous rappeler en priorité, normalement d'ici quelques minutes."
        : " Martin vous rappelle dès qu'il sort de son chantier.";
      const waterTip = isUrgent && (ctx.problem?.includes("fuite") || ctx.problem?.includes("eau"))
        ? " Et n'oubliez pas, coupez l'eau en attendant hein."
        : "";

      return {
        response: pick([
          `Super. ${recap}${callback}${waterTip} Voilà, c'est tout bon de mon côté. Bonne journée à vous !`,
          `Parfait. ${recap}${callback}${waterTip} On est bon ! Bonne journée, et à bientôt.`,
          `C'est noté. ${recap}${callback}${waterTip} Allez, bonne journée ! Martin vous rappelle vite.`,
        ]),
        nextState: "ended",
        updatedContext: ctx,
      };
    }

    default: {
      ctx.problem = userText;
      return {
        response: "OK je vois. Je vais transmettre ça à Martin. C'est à quel nom ?",
        nextState: "waiting_name",
        updatedContext: ctx,
      };
    }
  }
}

// === COMPONENT ===

export default function VoiceDemo() {
  const [callActive, setCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const stateRef = useRef<ConversationState>("idle");
  const contextRef = useRef<Record<string, string>>({});
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [useElevenLabs, setUseElevenLabs] = useState(true);

  // Load browser voices as fallback
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

  // --- SPEAK WITH ELEVENLABS (human-quality voice) ---
  const speakWithElevenLabs = useCallback(async (text: string, onEnd?: () => void) => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("TTS API failed");

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        onEnd?.();
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        onEnd?.();
      };

      await audio.play();
    } catch {
      // ElevenLabs failed — disable it and fall back to browser voice
      setUseElevenLabs(false);
      speakWithBrowser(text, onEnd);
    }
  }, []);

  // --- FALLBACK: Browser Speech Synthesis with natural pauses ---
  const speakWithBrowser = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();

    const chunks = text
      .split(/(?<=[.!?])\s+/)
      .filter((c) => c.trim().length > 0);

    const voices = window.speechSynthesis.getVoices();
    const frenchVoice =
      voices.find((v) => v.lang === "fr-FR" && v.name.toLowerCase().includes("google")) ||
      voices.find((v) => v.lang === "fr-FR" && !v.name.toLowerCase().includes("compact")) ||
      voices.find((v) => v.lang.startsWith("fr"));

    let chunkIndex = 0;

    const speakNext = () => {
      if (chunkIndex >= chunks.length) {
        setIsSpeaking(false);
        onEnd?.();
        return;
      }

      const chunk = chunks[chunkIndex];
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = "fr-FR";
      utterance.rate = chunk.includes("?") ? 0.89 : 0.92;
      utterance.pitch = chunk.includes("?") ? 1.05 : 1.0;

      if (frenchVoice) utterance.voice = frenchVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        chunkIndex++;
        if (chunkIndex < chunks.length) {
          setTimeout(speakNext, 200 + Math.random() * 300);
        } else {
          setIsSpeaking(false);
          onEnd?.();
        }
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    };

    setIsSpeaking(true);
    speakNext();
  }, []);

  // --- MAIN SPEAK FUNCTION ---
  const speakNaturally = useCallback((text: string, onEnd?: () => void) => {
    if (useElevenLabs) {
      speakWithElevenLabs(text, onEnd);
    } else {
      speakWithBrowser(text, onEnd);
    }
  }, [useElevenLabs, speakWithElevenLabs, speakWithBrowser]);

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

        // Small "thinking" pause before responding (like a real human)
        const thinkingDelay = 300 + Math.random() * 400;
        setTimeout(() => {
          const { response, nextState, updatedContext } = getAssistantResponse(
            transcript,
            stateRef.current,
            contextRef.current
          );

          stateRef.current = nextState;
          contextRef.current = updatedContext;

          const assistantMessage: Message = { role: "assistant", text: response };
          setMessages((prev) => [...prev, assistantMessage]);
          scrollToBottom();

          speakNaturally(response, () => {
            if (nextState !== "ended") {
              setTimeout(() => startListening(), 300);
            }
          });
        }, thinkingDelay);
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
  }, [speakNaturally, scrollToBottom]);

  const startCall = useCallback(() => {
    setCallActive(true);
    setMessages([]);
    setCallDuration(0);
    stateRef.current = "greeting";
    contextRef.current = {};

    // Start call timer
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Small delay before greeting (simulates phone ringing)
    setTimeout(() => {
      const greeting = pick([
        "Martin Plomberie, bonjour ! Alors, Martin est en intervention là, mais je suis son assistant. Dites-moi ce qu'il se passe, je lui transmets.",
        "Allô, Martin Plomberie ! Martin est sur un chantier en ce moment. Qu'est-ce qui vous arrive ? Je prends votre message.",
        "Oui bonjour, Martin Plomberie ! Martin peut pas prendre l'appel pour le moment, il est en déplacement. Dites-moi tout, je note pour lui.",
      ]);

      const assistantMessage: Message = { role: "assistant", text: greeting };
      setMessages([assistantMessage]);

      speakNaturally(greeting, () => {
        stateRef.current = "waiting_problem";
        startListening();
      });
    }, 800);
  }, [speakNaturally, startListening]);

  const endCall = useCallback(() => {
    setCallActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentTranscript("");
    stateRef.current = "idle";
    contextRef.current = {};
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

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
            Testez l&apos;assistant de Martin Plomberie
          </h1>
          <p className="text-gray-500 text-sm">
            Appuyez sur le bouton vert, parlez comme si vous appeliez un plombier.
          </p>
        </div>

        {/* Phone UI */}
        <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl max-w-md mx-auto">
          {/* Call header */}
          <div className="text-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 mx-auto mb-3">
              <Phone size={28} className={`text-emerald-400 ${callActive ? "animate-pulse" : ""}`} />
            </div>
            <p className="text-white font-semibold text-lg">Martin Plomberie</p>
            {callActive && (
              <p className="text-emerald-400 text-xs font-mono mt-1">{formatTime(callDuration)}</p>
            )}
            <p className="text-gray-400 text-sm mt-1">
              {!callActive
                ? "Appuyez pour appeler"
                : isSpeaking
                  ? "L'assistant parle..."
                  : isListening
                    ? "Parlez maintenant..."
                    : "En ligne"}
            </p>
          </div>

          {/* Messages */}
          {callActive && (
            <div className="bg-gray-800/80 rounded-2xl p-4 mb-5 h-72 overflow-y-auto scrollbar-thin">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-md"
                      : "bg-gray-700 text-gray-100 rounded-bl-md"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {currentTranscript && (
                <div className="mb-3 flex justify-end">
                  <div className="px-4 py-2.5 rounded-2xl rounded-br-md text-sm bg-emerald-600/40 text-white/60 max-w-[85%] italic">
                    {currentTranscript}...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Listening indicator */}
          {isListening && (
            <div className="flex justify-center gap-1 mb-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full animate-pulse"
                  style={{
                    height: `${12 + Math.random() * 16}px`,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: "0.6s",
                  }}
                />
              ))}
            </div>
          )}

          {/* Call buttons */}
          <div className="flex justify-center gap-6">
            {!callActive ? (
              <button
                onClick={startCall}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30 active:scale-95 hover:scale-105"
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
                  className={`flex h-14 w-14 items-center justify-center rounded-full transition-all ${
                    isListening
                      ? "bg-emerald-500 shadow-lg shadow-emerald-500/40 scale-110"
                      : isSpeaking
                        ? "bg-gray-800 cursor-not-allowed opacity-50"
                        : "bg-gray-700 hover:bg-gray-600 active:scale-95"
                  }`}
                >
                  {isListening ? <Mic size={24} className="text-white" /> : <MicOff size={24} className="text-gray-300" />}
                </button>

                <button
                  onClick={() => {
                    endCall();
                    startCall();
                  }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-all active:scale-95"
                  title="Recommencer"
                >
                  <RotateCcw size={20} className="text-gray-300" />
                </button>

                <button
                  onClick={endCall}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 hover:bg-red-400 transition-all active:scale-95"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "J'ai une fuite sous l'évier, ça coule partout",
              "Mon chauffe-eau marche plus depuis ce matin",
              "Mes toilettes sont bouchées, c'est urgent",
              "C'est combien pour un dépannage ?",
              "Vous pouvez venir aujourd'hui ?",
              "J'ai un radiateur qui chauffe plus",
            ].map((phrase) => (
              <div key={phrase} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
                <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                <span>&quot;{phrase}&quot;</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Vous êtes artisan ? On configure le même assistant avec <strong>votre nom</strong> et <strong>votre métier</strong>.
          </p>
          <a
            href="mailto:shopbot.ai.pro@gmail.com?subject=AlloPro AI — Je veux tester pour mon entreprise"
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

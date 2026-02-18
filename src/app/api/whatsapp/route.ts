import { NextRequest, NextResponse } from "next/server";

// ========================================
// WEBHOOK WHATSAPP - Meta Cloud API
// ========================================
// Ce webhook reçoit les messages WhatsApp et répond automatiquement
// en utilisant le même moteur de chatbot que le site web.
//
// Variables d'environnement nécessaires :
// - WHATSAPP_VERIFY_TOKEN : token de vérification (tu le choisis toi-même)
// - WHATSAPP_ACCESS_TOKEN : token d'accès Meta (depuis developers.facebook.com)
// - WHATSAPP_PHONE_NUMBER_ID : ID du numéro WhatsApp Business
// ========================================

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "shopbot-ai-verify-2026";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";

// --- GET : Vérification du webhook par Meta ---
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook WhatsApp vérifié avec succès");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Token de vérification invalide" }, { status: 403 });
}

// --- POST : Réception des messages WhatsApp ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Vérifier que c'est un message WhatsApp
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      // Pas de message (peut être un status update), on retourne 200
      return NextResponse.json({ status: "ok" });
    }

    const message = messages[0];
    const from = message.from; // Numéro du client
    const messageText = message.text?.body || "";

    if (!messageText) {
      return NextResponse.json({ status: "ok" });
    }

    console.log(`📱 Message WhatsApp reçu de ${from}: ${messageText}`);

    // Obtenir la réponse du chatbot
    const botReply = await getChatbotReply(messageText);

    // Envoyer la réponse via l'API WhatsApp
    await sendWhatsAppMessage(from, botReply);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("❌ Erreur webhook WhatsApp:", error);
    return NextResponse.json({ status: "ok" }); // Toujours retourner 200 pour Meta
  }
}

// --- Obtenir la réponse du chatbot ---
async function getChatbotReply(userMessage: string): Promise<string> {
  try {
    // Appeler notre propre API chat
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMessage }],
        mode: "demo",
      }),
    });

    const data = await res.json();
    return data.reply || "Désolé, je n'ai pas pu traiter votre message. Appelez-nous au salon !";
  } catch (error) {
    console.error("Erreur chatbot:", error);
    return "Désolé, une erreur est survenue. N'hésitez pas à nous appeler directement au salon !";
  }
}

// --- Envoyer un message WhatsApp ---
async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.error("⚠️ WHATSAPP_ACCESS_TOKEN ou WHATSAPP_PHONE_NUMBER_ID non configuré");
    return;
  }

  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: text },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("❌ Erreur envoi WhatsApp:", error);
  } else {
    console.log(`✅ Message envoyé à ${to}`);
  }
}

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SALON_SYSTEM_PROMPT = `Tu es l'assistant IA du salon de coiffure "Élégance Paris", situé au 42 rue du Faubourg Saint-Honoré, Paris 8e.

INFORMATIONS DU SALON :
- Horaires : Mardi-Samedi 9h-19h, Dimanche-Lundi fermé
- Téléphone : 01 42 XX XX XX
- Réservation en ligne : eleganceparis.fr/rdv

TARIFS :
- Coupe femme : 45€
- Coupe homme : 25€
- Brushing : 30€
- Coloration complète : 80€
- Mèches / Balayage : à partir de 90€
- Lissage brésilien : 150€
- Coupe + Brushing : 65€
- Coupe enfant (- de 12 ans) : 18€
- Barbe : 15€
- Soin profond : 25€

COIFFEURS :
- Sarah (responsable / gérante) : spécialiste couleur et balayage
- Karim : spécialiste coupe homme et barbe
- Julie : spécialiste lissage et soins
- Marco : coiffeur polyvalent

RÈGLES IMPORTANTES :
- Sois chaleureux, professionnel et concis (2-4 phrases max)
- Réponds TOUJOURS en français sauf si le client parle une autre langue
- Si le client veut prendre RDV, redirige vers la réservation en ligne (eleganceparis.fr/rdv) ou le téléphone (01 42 XX XX XX)
- Si le client donne un jour + une heure, confirme sa demande et redirige vers la réservation
- Ne donne JAMAIS de conseils médicaux
- Si tu ne sais pas quelque chose, dis-le honnêtement et propose d'appeler le salon
- Utilise des emojis avec modération (1-2 max par message)
- Si le client est impoli ou t'insulte, reste calme, poli et professionnel. Dis-lui gentiment que tu es là pour l'aider et redirige vers le sujet
- Tu es un chatbot du salon, tu ne parles QUE de sujets liés au salon, à la coiffure et à la beauté. Si on te demande autre chose, ramène poliment la conversation vers le salon
- Sois naturel et humain dans tes réponses, pas robotique`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Si pas de clé API → fallback sur réponses scriptées
  if (!apiKey || apiKey === "your-anthropic-api-key-here") {
    const allMessages = messages.map((m: { role: string; content: string }) => m.content.toLowerCase()).join(" ");
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
    // Collect previous bot replies to avoid repetition
    const previousReplies = messages
      .filter((m: { role: string; content: string }) => m.role === "assistant")
      .map((m: { role: string; content: string }) => m.content);
    const reply = getSmartReply(lastMessage, allMessages, previousReplies);
    await new Promise(resolve => setTimeout(resolve, 400 + Math.min(reply.length * 5, 1200)));
    return NextResponse.json({ reply });
  }

  // Mode IA avec Claude
  try {
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: SALON_SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const reply = response.content[0].type === "text" ? response.content[0].text : "Désolé, je n'ai pas pu répondre.";
    return NextResponse.json({ reply });
  } catch (error) {
    // Si l'API échoue, fallback sur scriptée
    console.error("Anthropic API error:", error);
    const allMessages = messages.map((m: { role: string; content: string }) => m.content.toLowerCase()).join(" ");
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
    const previousReplies = messages
      .filter((m: { role: string; content: string }) => m.role === "assistant")
      .map((m: { role: string; content: string }) => m.content);
    const reply = getSmartReply(lastMessage, allMessages, previousReplies);
    return NextResponse.json({ reply });
  }
}

// --- Moteur de réponses intelligent ---

interface Rule {
  keywords: string[];
  mustNotHave?: string[];
  response: string | string[];
  priority?: number;
}

function matches(message: string, keywords: string[]): boolean {
  return keywords.some(kw => {
    // Support multi-word keywords
    if (kw.includes(" ")) return message.includes(kw);
    // Single word: match as substring
    return message.includes(kw);
  });
}

function pickRandom(responses: string | string[], previousReplies: string[] = []): string {
  if (typeof responses === "string") return responses;
  // Filter out responses that were already used recently
  const lastReply = previousReplies.length > 0 ? previousReplies[previousReplies.length - 1] : "";
  const unused = responses.filter(r => r !== lastReply);
  // If all have been used, just pick any that's not the last one
  const pool = unused.length > 0 ? unused : responses;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getSmartReply(message: string, context: string, previousReplies: string[] = []): string {
  // Normalize: remove accents for matching
  const normalized = message
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "'")
    .replace(/[?!.,;:]/g, " ")
    .toLowerCase();

  // Detect if message contains a time pattern (9h, 9h30, 14h, etc.)
  const hasTime = /\d{1,2}[h:]\d{0,2}/.test(normalized);
  // Detect if message contains a day of the week
  const hasDay = /lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/.test(normalized);
  // Detect if message mentions a staff member or role
  const hasStaff = /sarah|karim|julie|marco|gerante|gérante|responsable|patron/.test(message.toLowerCase());
  // Detect confirmation pattern
  const isConfirmation = /^(oui|ouais|ok|d'accord|parfait|yes|yep|c'est bon|nickel|go)/.test(normalized);

  const rules: Rule[] = [
    // --- PRISE DE RDV CONCRÈTE (jour + heure + éventuellement coiffeur) ---
    // HAUTE PRIORITÉ : doit passer AVANT les horaires
    {
      keywords: ["__SPECIAL_APPOINTMENT__"],
      response: "", // placeholder, handled below
    },

    // --- SALUTATIONS ---
    {
      keywords: ["bonjour", "salut", "hello", "bonsoir", "coucou", "hey", "hi ", "yo ", "slt"],
      response: [
        "Bonjour et bienvenue chez Élégance Paris ! ✨ Comment puis-je vous aider ?",
        "Bonjour ! Ravie de vous accueillir chez Élégance Paris. Que puis-je faire pour vous ? ✨",
        "Hey, bienvenue chez Élégance Paris ! En quoi puis-je vous aider aujourd'hui ? 😊",
      ],
    },

    // --- COUPES (question générale) ---
    {
      keywords: ["belle coupe", "bonne coupe", "bien couper", "coupe bien", "bon coiffeur", "bonne coiffeuse", "coupe tendance", "coupe moderne", "coupe stylé", "coupe style", "joli coupe", "jolie coupe", "coiffure tendance"],
      response: [
        "Absolument ! Nos coiffeurs sont spécialisés dans les coupes tendance et personnalisées ✂️ Sarah, Karim, Julie et Marco sauront trouver la coupe parfaite pour vous. Chaque coupe commence par un diagnostic de vos cheveux et de vos envies. Vous souhaitez prendre rendez-vous ?",
        "Bien sûr ! Chez Élégance Paris, chaque coupe est pensée sur-mesure pour vous ✂️ Nos coiffeurs prennent le temps d'écouter vos envies et de vous conseiller la coupe idéale. On vous réserve un créneau ?",
      ],
    },

    // --- COUPE FEMME ---
    {
      keywords: ["coupe femme", "coupe pour femme", "couper les cheveux femme", "coupe dame"],
      response: "La coupe femme est à 45€ chez nous ✂️ Si vous souhaitez aussi un brushing, le combo Coupe + Brushing est à 65€. Nos coiffeurs prendront le temps de bien comprendre ce que vous voulez. Souhaitez-vous réserver ?",
    },

    // --- COUPE HOMME ---
    {
      keywords: ["coupe homme", "coupe pour homme", "coupe mec", "coupe gars", "coupe masculine"],
      response: "La coupe homme est à 25€ 💈 Et si vous voulez la barbe en plus, c'est 35€ le combo ! Karim est notre expert coupe homme, il maîtrise tous les styles : dégradé, fade, classique... Vous voulez qu'on vous réserve un créneau avec lui ?",
    },

    // --- COUPE + question générique ---
    {
      keywords: ["coupe", "couper", "coupes", "coupez", "coiffer", "coiffure", "coiffez", "coiffe"],
      mustNotHave: ["femme", "homme", "enfant", "barbe", "prix", "tarif", "combien"],
      response: [
        "Nous proposons des coupes pour tous ! ✂️\n\n💇‍♀️ Coupe femme : 45€\n💇‍♂️ Coupe homme : 25€\n👧 Coupe enfant : 18€\n💇‍♀️ Coupe + Brushing : 65€\n\nChaque coupe est personnalisée selon vos envies et la nature de vos cheveux. Pour quel type de coupe seriez-vous intéressé(e) ?",
        "On adore ce qu'on fait ! ✂️ Nos coiffeurs sont passionnés et à la pointe des tendances. Voici nos formules :\n\n- Coupe femme : 45€\n- Coupe homme : 25€\n- Coupe enfant : 18€\n- Coupe + Brushing : 65€\n\nVous souhaitez réserver ?",
      ],
    },

    // --- DEGRADÉ / FADE ---
    {
      keywords: ["degrade", "degradé", "dégradé", "fade", "taper", "undercut", "fondu"],
      response: "Le dégradé c'est la spécialité de Karim ! 💈 Il maîtrise tous les styles : low fade, mid fade, high fade, taper... La coupe homme est à 25€. Vous pouvez ajouter la barbe pour 15€ de plus. On vous réserve un créneau avec lui ?",
    },

    // --- TARIFS / PRIX ---
    {
      keywords: ["tarif", "prix", "combien", "cout", "coute", "coûte", "cher", "pas cher", "budget", "grille", "carte des prix"],
      response: "Voici nos tarifs chez Élégance Paris :\n\n✂️ Coupe femme : 45€\n💈 Coupe homme : 25€\n💇‍♀️ Coupe + Brushing : 65€\n🎨 Coloration : 80€\n✨ Balayage : à partir de 90€\n💆 Lissage brésilien : 150€\n👧 Coupe enfant : 18€\n🧔 Barbe : 15€\n💆‍♀️ Soin profond : 25€\n\nUne prestation vous intéresse en particulier ?",
    },

    // --- HORAIRES (seulement si pas une demande de RDV) ---
    {
      keywords: ["horaire", "ouvert", "ouvre", "ferme", "fermé", "heure", "semaine", "week-end", "weekend"],
      response: [
        "Nous sommes ouverts du mardi au samedi, de 9h à 19h 🕐 Le dimanche et le lundi, le salon est fermé. Souhaitez-vous prendre rendez-vous ?",
        "Nos horaires :\n\n📅 Mardi → Samedi : 9h - 19h\n🚫 Dimanche & Lundi : Fermé\n\nOn vous attend quand ? 😊",
      ],
    },

    // --- RENDEZ-VOUS ---
    {
      keywords: ["rdv", "rendez-vous", "rendez vous", "reserver", "réserver", "reservation", "réservation", "dispo", "disponible", "disponibilite", "créneau", "creneau", "place", "venir", "passer"],
      response: "Super ! Pour réserver votre créneau :\n\n📱 En ligne : eleganceparis.fr/rdv (rapide et simple)\n📞 Par téléphone : 01 42 XX XX XX\n\nNous sommes ouverts du mardi au samedi, 9h-19h. Avez-vous une préférence pour un coiffeur en particulier ? 😊",
    },

    // --- COLORATION / COULEUR ---
    {
      keywords: ["coloration", "couleur", "teinte", "teinture", "meche", "mèche", "balayage", "blond", "brun", "roux", "rouge", "reflet", "ombré", "ombre", "tie and dye", "tie & dye"],
      response: [
        "La couleur c'est l'expertise de Sarah, notre responsable ! 🎨\n\n- Coloration complète : 80€\n- Mèches / Balayage : à partir de 90€\n\nElle prend le temps de diagnostiquer vos cheveux et de choisir la nuance parfaite pour vous. Le résultat est toujours naturel et lumineux. On vous réserve un RDV avec elle ?",
        "Vous voulez changer de couleur ? Excellente idée ! 🎨 Sarah est notre experte, elle fait des merveilles :\n\n- Coloration complète : 80€\n- Balayage / Mèches : à partir de 90€\n\nElle vous conseillera la teinte idéale selon votre carnation et vos envies. Intéressé(e) ?",
      ],
    },

    // --- LISSAGE ---
    {
      keywords: ["lissage", "lisser", "keratine", "kératine", "bresilien", "brésilien", "defriser", "défriser", "lisse", "raide"],
      response: "Le lissage brésilien est la spécialité de Julie ! 💆‍♀️\n\n- Lissage brésilien à la kératine : 150€\n- Durée : environ 2h30\n- Tient 3-4 mois\n- Résultat : cheveux lisses, brillants et nourris\n\nC'est un soin qui respecte la fibre capillaire. Julie vous expliquera tout en détail lors du RDV. On réserve ?",
    },

    // --- SOINS ---
    {
      keywords: ["soin", "traitement", "abime", "abîme", "sec", "secs", "fourche", "fourches", "cassant", "hydrat", "nourri", "reparer", "réparer"],
      response: "Nous avons un soin profond à 25€ qui fait des merveilles ! 💆‍♀️ Julie est notre spécialiste soins capillaires. Le soin nourrit en profondeur, répare les pointes abîmées et redonne de la brillance à vos cheveux. Parfait en complément d'une coupe ou d'une coloration. Ça vous tente ?",
    },

    // --- BRUSHING ---
    {
      keywords: ["brushing", "brush", "mise en forme", "mise en pli", "secher", "sécher"],
      response: "Le brushing est à 30€ en solo, ou 65€ avec la coupe (Coupe + Brushing) 💇‍♀️ Nos coiffeurs maîtrisent tous les styles : brushing lisse, wavy, volume... Qu'est-ce qui vous ferait plaisir ?",
    },

    // --- BARBE ---
    {
      keywords: ["barbe", "raser", "rasage", "bouc", "moustache", "taille de barbe", "tailler"],
      response: "Karim est notre expert barbe ! 🧔\n\n- Taille de barbe : 15€\n- Coupe homme + Barbe : 35€\n\nIl maîtrise toutes les techniques : dégradé barbe, barbe sculptée, rasage net... Vous voulez un créneau avec lui ?",
    },

    // --- ENFANTS ---
    {
      keywords: ["enfant", "gamin", "petit", "petite", "fille", "fils", "bebe", "bébé", "ado", "adolescent", "junior", "garçon", "garcon", "fillette"],
      response: "Bien sûr, on accueille les enfants avec plaisir ! 👧👦\n\nCoupe enfant (moins de 12 ans) : 18€\n\nNos coiffeurs sont super patients et mettent les petits à l'aise. On a même des magazines et des dessins animés pour les occuper pendant la coupe ! Vous souhaitez réserver ?",
    },

    // --- ADRESSE / LOCALISATION ---
    {
      keywords: ["adresse", "ou etes", "où êtes", "où est", "ou est", "situe", "situé", "localisation", "trouver", "venir", "acces", "accès", "metro", "métro", "transport", "garer", "parking"],
      response: "Nous sommes au 42 rue du Faubourg Saint-Honoré, Paris 8e 📍\n\n🚇 Métro : Madeleine (lignes 8, 12, 14) ou Concorde (lignes 1, 8, 12)\n🅿️ Parking le plus proche : Parking Madeleine\n\nLe salon est facilement accessible en transports en commun. À bientôt ! 😊",
    },

    // --- EQUIPE / COIFFEURS ---
    {
      keywords: ["equipe", "équipe", "coiffeur", "coiffeuse", "staff", "qui coiffe", "sarah", "karim", "julie", "marco", "meilleur coiffeur", "recommand", "conseil"],
      response: "Notre équipe est composée de 4 coiffeurs passionnés :\n\n👩‍🎨 Sarah (responsable) — Experte couleur et balayage\n💈 Karim — Spécialiste coupe homme et barbe\n💆 Julie — Spécialiste lissage et soins\n✂️ Marco — Coiffeur polyvalent, tous styles\n\nChacun a sa spécialité, mais tous sont excellents ! Vous avez une préférence ?",
    },

    // --- QUALITÉ / AVIS ---
    {
      keywords: ["avis", "bien", "bon salon", "recommande", "qualité", "qualite", "confiance", "professionnel", "resultat", "résultat", "satisfait", "content", "top", "genial", "génial"],
      response: [
        "Merci pour votre confiance ! ✨ Nos clients sont notre meilleure pub. On a une note de 4.8/5 avec plus de 200 avis Google. Notre secret : on prend le temps d'écouter chaque client et de personnaliser chaque prestation. Venez nous tester, vous ne serez pas déçu(e) !",
        "Chez Élégance Paris, on met un point d'honneur sur la qualité ✨ Plus de 200 avis clients avec une note de 4.8/5. On prend vraiment le temps avec chaque personne. Le bouche-à-oreille est notre meilleure publicité ! Passez nous voir 😊",
      ],
    },

    // --- MARIAGE / ÉVÉNEMENT ---
    {
      keywords: ["mariage", "mariee", "mariée", "soiree", "soirée", "evenement", "événement", "gala", "fete", "fête", "chignon", "ceremonie", "cérémonie"],
      response: "Félicitations ! 🎉 Nous proposons des coiffures événementielles (mariage, soirée, gala...). Pour ce type de prestation, on vous conseille de prendre rendez-vous directement par téléphone au 01 42 XX XX XX pour discuter de vos envies et faire un essai coiffure en amont. Sarah et Marco sont excellents pour les coiffures de cérémonie !",
    },

    // --- PRODUITS ---
    {
      keywords: ["produit", "shampoing", "shampooing", "après-shampoing", "apres shampoing", "gamme", "marque", "kerastase", "kérastase", "olaplex", "acheter"],
      response: "Nous utilisons et vendons des produits professionnels haut de gamme au salon 💅 Nos coiffeurs pourront vous conseiller les produits adaptés à votre type de cheveux. N'hésitez pas à demander conseil lors de votre prochain passage !",
    },

    // --- CHEVEUX SPÉCIFIQUES ---
    {
      keywords: ["boucle", "bouclé", "frisé", "frise", "afro", "crepu", "crépu", "naturel", "curly", "ondule", "ondulé", "epais", "épais", "fin", "fins", "plat"],
      response: [
        "Chez Élégance Paris, on adore travailler tous les types de cheveux ! 💇‍♀️ Que vous ayez les cheveux bouclés, frisés, raides ou fins, nos coiffeurs sauront sublimer votre texture naturelle. Marco et Sarah sont particulièrement à l'aise avec les cheveux texturés. On vous réserve un créneau ?",
        "Quelle que soit votre texture de cheveux, on s'adapte ! ✂️ Nos coiffeurs sont formés pour travailler tous les types de cheveux. On prend le temps de comprendre vos cheveux pour vous proposer la meilleure coupe et les meilleurs soins. Vous souhaitez prendre RDV ?",
      ],
    },

    // --- DURÉE ---
    {
      keywords: ["dure combien", "combien de temps", "duree", "durée", "temps", "rapide", "vite", "long", "attendre", "attente"],
      response: "Voici les durées approximatives de nos prestations :\n\n✂️ Coupe : 30-45 min\n💇‍♀️ Coupe + Brushing : 1h\n🎨 Coloration : 1h30-2h\n✨ Balayage : 2h-2h30\n💆 Lissage brésilien : 2h30-3h\n🧔 Barbe : 20 min\n\nOn prend le temps qu'il faut pour un résultat parfait 😊",
    },

    // --- PAIEMENT ---
    {
      keywords: ["payer", "paiement", "carte", "espece", "espèce", "cb", "cheque", "chèque", "cash", "liquide", "apple pay", "sans contact"],
      response: "Nous acceptons tous les moyens de paiement 💳\n\n- Carte bancaire (sans contact)\n- Espèces\n- Apple Pay / Google Pay\n\nPas de chèques en revanche. Simple et pratique !",
    },

    // --- ANNULATION ---
    {
      keywords: ["annuler", "annulation", "reporter", "decaler", "décaler", "changer", "modifier", "deplacer", "déplacer"],
      response: "Pas de souci, vous pouvez annuler ou modifier votre rendez-vous jusqu'à 24h avant. Il suffit de nous appeler au 01 42 XX XX XX ou de modifier directement sur eleganceparis.fr/rdv 📱 Au-delà, on vous demandera juste de nous prévenir le plus tôt possible !",
    },

    // --- PREMIÈRE VISITE ---
    {
      keywords: ["premiere fois", "première fois", "premier rdv", "nouveau client", "nouvelle cliente", "jamais venu", "connais pas", "decouvrir", "découvrir", "essayer"],
      response: "Bienvenue ! Pour une première visite, on prend toujours un petit temps en plus pour vous connaître ✨ On discute de vos envies, de vos habitudes, de la nature de vos cheveux... Comme ça, le résultat est vraiment personnalisé. Pas de stress, on est là pour vous conseiller ! Prêt(e) à réserver ?",
    },

    // --- REMERCIEMENTS ---
    {
      keywords: ["merci", "super", "parfait", "genial", "génial", "cool", "nickel", "excellent", "au revoir", "bye", "bonne journee", "bonne journée", "a bientot", "à bientôt"],
      response: [
        "Avec plaisir ! N'hésitez pas si vous avez d'autres questions. À très bientôt chez Élégance Paris ! ✨",
        "Merci à vous ! On a hâte de vous accueillir au salon. À bientôt ! 😊",
        "Tout le plaisir est pour moi ! À très vite chez Élégance Paris ✨",
      ],
    },

    // --- OUI / CONFIRMATION ---
    {
      keywords: ["oui", "ouais", "d'accord", "d accord", "ok", "je veux", "volontiers", "ca m'interesse", "ça m'intéresse", "pourquoi pas", "allons-y", "go ", "lets go", "let's go", "c'est parti"],
      response: "Parfait ! 🎉 Pour réserver votre créneau :\n\n📱 En ligne : eleganceparis.fr/rdv\n📞 Par téléphone : 01 42 XX XX XX\n\nOn a hâte de vous accueillir !",
    },

    // --- NON / HÉSITATION ---
    {
      keywords: ["non", "pas pour le moment", "je reflechis", "je réfléchis", "je sais pas", "je ne sais pas", "peut-etre", "peut-être", "on verra", "plus tard", "pas sur", "pas sûr"],
      response: "Pas de problème, prenez votre temps ! 😊 On est là si vous avez d'autres questions. N'hésitez pas à revenir quand vous voulez, on sera ravis de vous accueillir.",
    },

    // --- WIFI / ATTENTE ---
    {
      keywords: ["wifi", "wi-fi", "internet", "attendre", "salle d'attente", "magazine", "cafe", "café", "boisson"],
      response: "On pense à votre confort ! ☕ Wi-Fi gratuit disponible au salon, café ou thé offert à votre arrivée. On a aussi des magazines si vous préférez déconnecter. Vous serez chouchouté(e) !",
    },

    // --- CADEAU / BON ---
    {
      keywords: ["cadeau", "bon cadeau", "carte cadeau", "offrir", "idee cadeau", "idée cadeau", "gift"],
      response: "Excellente idée ! 🎁 Nous proposons des cartes cadeaux de n'importe quel montant. C'est le cadeau parfait pour faire plaisir ! Passez au salon ou appelez-nous au 01 42 XX XX XX pour en commander une.",
    },

    // --- INSULTES / IMPOLITESSE ---
    {
      keywords: ["nul", "naze", "merde", "putain", "con", "connard", "connasse", "fdp", "ntm", "ta gueule", "ferme la", "ferme-la", "degage", "dégage", "casse toi", "casse-toi", "enculé", "encule", "batard", "bâtard", "pd", "pute", "salaud", "salope", "idiot", "debile", "débile", "abruti", "cretin", "crétin", "imbecile", "imbécile", "stupide", "moche", "arnaque", "arnaqueur", "voleur", "escroc"],
      response: [
        "Je comprends que quelque chose puisse vous frustrer, et j'en suis désolé 😊 Je suis là pour vous aider du mieux possible. Puis-je faire quelque chose pour vous ? Tarifs, réservation, informations sur le salon ?",
        "Aïe, on est parti du mauvais pied on dirait 😅 Pas de souci, je reste à votre disposition. Si vous avez une question sur le salon, je suis là pour ça !",
        "Ce n'est pas très gentil, mais je ne vous en veux pas ! 😊 Mon rôle c'est de vous aider. Vous avez besoin d'infos sur le salon ou de prendre rendez-vous ?",
      ],
    },

    // --- PLAINTE / MÉCONTENTEMENT ---
    {
      keywords: ["pas content", "pas satisfait", "plainte", "reclam", "réclam", "rembours", "mauvais", "horrible", "catastrophe", "desastre", "rate", "raté", "abimer", "abîmer", "massacr"],
      response: "Je suis vraiment désolé d'apprendre ça 😔 Votre satisfaction est notre priorité. Je vous invite à appeler directement le salon au 01 42 XX XX XX pour en discuter avec Sarah, notre responsable. Elle prendra le temps de comprendre la situation et de trouver une solution. On tient beaucoup à nos clients.",
    },

    // --- HUMOUR / BLAGUE ---
    {
      keywords: ["haha", "lol", "mdr", "ptdr", "drole", "drôle", "blague", "marrant", "rigol", "😂", "🤣", "😆"],
      response: [
        "Haha, content(e) de vous faire sourire ! 😄 Plus sérieusement, est-ce que je peux vous aider avec quelque chose au salon ?",
        "😄 L'ambiance est déjà au top ! Au fait, je peux vous aider pour une coupe, une coloration, ou une réservation ?",
      ],
    },

    // --- QUESTIONS SUR LE BOT ---
    {
      keywords: ["t'es un robot", "t'es un bot", "es-tu un robot", "es tu un bot", "t'es une ia", "intelligence artificielle", "humain ou robot", "vrai personne", "parle a un humain", "parler a quelqu'un", "t'es qui", "tu es qui", "c'est qui", "comment tu t'appelle"],
      response: [
        "Je suis l'assistant virtuel d'Élégance Paris ! 🤖✨ Je suis là 24h/24 pour répondre à vos questions sur le salon. Si vous préférez parler à quelqu'un de l'équipe, n'hésitez pas à appeler au 01 42 XX XX XX !",
        "Bien vu ! Je suis un assistant IA, disponible jour et nuit pour vous renseigner sur le salon 😊 Mais si vous avez besoin de parler à un humain, appelez-nous au 01 42 XX XX XX, l'équipe sera ravie de vous répondre !",
      ],
    },

    // --- HORS-SUJET : météo, politique, sport, etc. ---
    {
      keywords: ["meteo", "météo", "temps qu'il fait", "il pleut", "il fait beau", "politique", "president", "président", "election", "élection", "foot", "football", "match", "psg", "marseille", "film", "serie", "série", "netflix", "musique", "chanson", "recette", "cuisine", "manger", "restaurant"],
      response: [
        "Haha, bonne question, mais je suis spécialisé dans la coiffure, pas la météo ! ☀️😄 Par contre, si vous voulez une coupe qui résiste à la pluie, on a ce qu'il faut. Vous avez besoin d'infos sur le salon ?",
        "Ah, ça sort un peu de mon domaine ! 😄 Moi je suis calé en coupes, colorations et lissages. Vous avez une question sur le salon ? Je suis tout ouïe !",
        "J'adorerais en discuter, mais je suis plutôt branché ciseaux et brushings ! ✂️😄 Qu'est-ce que je peux faire pour vous côté coiffure ?",
      ],
    },

    // --- DRAGUE / FLIRT ---
    {
      keywords: ["t'es belle", "t'es beau", "je t'aime", "tu me plais", "on sort ensemble", "ton numero", "ton numéro", "date", "diner", "dîner", "tu es charmant", "tu es mignon", "crush"],
      response: [
        "Oh, c'est gentil ! 😊 Mais je suis juste un assistant virtuel, je ne suis pas très doué en rendez-vous galants... Par contre, les rendez-vous coiffure, c'est mon truc ! Vous voulez réserver ? 💇",
        "Haha merci, vous êtes adorable ! 😄 Mais le seul rendez-vous que je peux vous proposer, c'est au salon ! Coupe, coloration, soin ? ✂️",
      ],
    },

    // --- TEST DU BOT ---
    {
      keywords: ["test", "tu marche", "tu marches", "ca marche", "ça marche", "tu fonctionne", "tu fonctionnes", "t'es la", "t'es là", "allo", "allô", "tu repond", "tu réponds", "tu m'entend", "tu m'entends"],
      response: [
        "Oui oui, je suis bien là ! 😊 Je fonctionne 24h/24 pour répondre à toutes vos questions sur Élégance Paris. Allez-y, posez-moi une question !",
        "Présent et opérationnel ! ✨ Posez-moi n'importe quelle question sur le salon : tarifs, horaires, coiffeurs, réservation... je gère !",
      ],
    },

    // --- URGENCE / PROBLÈME CHEVEUX ---
    {
      keywords: ["urgence", "urgent", "catastrophe capillaire", "raté ma couleur", "rate ma couleur", "cheveux vert", "cheveux orange", "cheveux cassé", "cheveux brule", "cheveux brûle", "gros probleme", "au secours", "help", "sos", "disaster"],
      response: "Oh non, je comprends le stress ! 😰 Le mieux c'est d'appeler directement le salon au 01 42 XX XX XX pour expliquer la situation. Nos coiffeurs sont habitués aux rattrapages et trouveront une solution. Sarah est experte en correction couleur. Appelez vite, on va arranger ça ! 💪",
    },

    // --- COMPLIMENTS SUR LE SALON ---
    {
      keywords: ["j'adore", "j'aime bien", "vous etes genial", "vous êtes génial", "trop bien", "incroyable", "magnifique", "bravo", "chapeau", "felicitation", "félicitation", "meilleur salon", "le meilleur"],
      response: [
        "Merci beaucoup, ça nous touche énormément ! 🥰 Toute l'équipe met tout son cœur dans son travail. On espère vous revoir très vite !",
        "Ça fait tellement plaisir à lire ! ✨ Merci pour ces mots, on transmettra à toute l'équipe. N'hésitez pas à nous laisser un avis Google, ça nous aide beaucoup ! 😊",
      ],
    },

    // --- DEMANDE VAGUE / "je sais pas quoi faire" ---
    {
      keywords: ["je sais pas quoi faire", "quoi faire", "vous conseillez quoi", "que me conseillez", "qu'est-ce que vous proposez", "que proposez", "idee", "idée", "suggestion", "inspir", "changement", "changer de tete", "changer de tête", "relooking", "je m'ennuie", "envie de changement"],
      response: [
        "Envie de changement ? J'adore ! ✨ Voici quelques idées :\n\n💇‍♀️ Une nouvelle coupe tendance\n🎨 Un balayage pour illuminer le visage\n💆 Un soin pour redonner vie à vos cheveux\n✨ Un lissage pour un look ultra lisse\n\nLe mieux, c'est de venir pour un diagnostic avec l'un de nos coiffeurs. Ils sauront vous conseiller selon votre visage et vos cheveux !",
        "Si vous hésitez, venez en consultation ! 😊 Nos coiffeurs adorent conseiller et trouver le look parfait. En ce moment, le balayage est très demandé, et le lissage brésilien fait des miracles. Envie de tester quelque chose ?",
      ],
    },

    // --- ACCESSIBILITÉ / HANDICAP / PMR ---
    {
      keywords: ["handicap", "handicapé", "handicapée", "fauteuil roulant", "fauteuil", "pmr", "accessib", "mobilité réduite", "mobilite reduite", "béquille", "bequille", "malvoyant", "aveugle", "sourd", "muet", "prothese", "prothèse", "invalidité", "invalidite", "mobilite", "mobilité", "rampe", "ascenseur", "difficulte a marcher", "difficulté à marcher", "probleme mobilite", "problème mobilité"],
      response: [
        "Votre confort est notre priorité ! ♿ Le salon Élégance Paris est accessible aux personnes à mobilité réduite : entrée de plain-pied, espace large entre les postes. N'hésitez pas à nous prévenir de vos besoins spécifiques lors de la réservation, on s'adapte ! 📞 01 42 XX XX XX",
        "Bien sûr, on accueille tout le monde chez Élégance Paris ! ♿ Notre salon est accessible (entrée sans marche, espace adapté). Si vous avez des besoins particuliers, prévenez-nous en réservant et on fera en sorte que tout soit parfait pour vous 😊 Appelez-nous au 01 42 XX XX XX !",
      ],
    },

    // --- EXPRESSIONS COURTES / RÉACTIONS ---
    {
      keywords: ["ah", "oh", "hmm", "euh", "bof", "mouais", "ok", "d'acc", "mhm", "interesting", "intéressant", "waw", "wow", "wahou"],
      response: [
        "Vous hésitez ? 😊 Pas de souci ! Dites-moi ce qui vous ferait plaisir et je vous guide. Coupe, couleur, soin... on a de quoi vous chouchouter !",
        "Je suis là si vous avez des questions ! 😊 N'hésitez pas à me demander n'importe quoi sur le salon.",
      ],
    },
  ];

  // --- PRIORITY 0: Specific appointment request (day + time or day + staff) ---
  if ((hasDay && hasTime) || (hasDay && hasStaff) || (hasTime && hasStaff) || (isConfirmation && (hasDay || hasTime || hasStaff))) {
    // Extract what we can from the message
    const dayMatch = normalized.match(/lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/);
    const timeMatch = normalized.match(/\d{1,2}[h:]\d{0,2}/);
    const day = dayMatch ? dayMatch[0].charAt(0).toUpperCase() + dayMatch[0].slice(1) : null;
    const time = timeMatch ? timeMatch[0] : null;

    // Map staff references
    let staffName = null;
    if (/sarah|gerante|gérante|responsable/.test(message.toLowerCase())) staffName = "Sarah";
    else if (/karim/.test(message.toLowerCase())) staffName = "Karim";
    else if (/julie/.test(message.toLowerCase())) staffName = "Julie";
    else if (/marco/.test(message.toLowerCase())) staffName = "Marco";

    // Check if it's a closed day
    if (day === "Dimanche" || day === "Lundi") {
      return `Malheureusement, le salon est fermé le ${day.toLowerCase()} 😕 Nous sommes ouverts du mardi au samedi, de 9h à 19h. Souhaitez-vous réserver un autre jour ?`;
    }

    // Build a personalized confirmation
    let confirmation = "Parfait ! ";
    if (day && time && staffName) {
      confirmation += `Je note votre demande pour ${day} à ${time} avec ${staffName} ✨`;
    } else if (day && time) {
      confirmation += `Je note votre demande pour ${day} à ${time} ✨`;
    } else if (day && staffName) {
      confirmation += `Je note votre demande pour ${day} avec ${staffName} ✨`;
    } else if (time && staffName) {
      confirmation += `Je note votre demande à ${time} avec ${staffName} ✨`;
    } else {
      confirmation += "Je note votre demande ✨";
    }

    confirmation += "\n\nPour confirmer définitivement votre créneau :\n📱 Réservez en ligne : eleganceparis.fr/rdv\n📞 Ou appelez-nous : 01 42 XX XX XX\n\nOn a hâte de vous accueillir ! 😊";
    return confirmation;
  }

  // --- PRIORITY 1: Confirmation with context (oui after a question about booking) ---
  if (isConfirmation && context.match(/reserver|rdv|rendez|creneau|créneau|reserve|book/)) {
    return "Parfait ! 🎉 Pour réserver votre créneau :\n\n📱 En ligne : eleganceparis.fr/rdv\n📞 Par téléphone : 01 42 XX XX XX\n\nVous avez une préférence de jour ou de coiffeur ? Je peux vous orienter !";
  }

  // Check rules by priority (order in array = priority)
  for (const rule of rules) {
    // Skip the placeholder rule
    if (rule.keywords[0] === "__SPECIAL_APPOINTMENT__") continue;
    if (matches(normalized, rule.keywords)) {
      // Check mustNotHave exclusions
      if (rule.mustNotHave && matches(normalized, rule.mustNotHave)) {
        continue;
      }
      return pickRandom(rule.response, previousReplies);
    }
  }

  // --- EXTRA: Day mentioned alone (without time) = probably asking availability ---
  if (hasDay && !hasTime) {
    const dayMatch = normalized.match(/lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/);
    const day = dayMatch ? dayMatch[0] : "";
    if (day === "dimanche" || day === "lundi") {
      return `Le salon est fermé le ${day} 😕 Nous sommes ouverts du mardi au samedi, de 9h à 19h. Un autre jour vous conviendrait ?`;
    }
    return `Oui, nous sommes ouverts le ${day}, de 9h à 19h ! 📅 Vous souhaitez réserver un créneau ? Dites-moi l'heure qui vous arrange et avec quel coiffeur si vous avez une préférence 😊`;
  }

  // --- FALLBACK INTELLIGENT ---
  // Try to detect intent from partial words and give a helpful response
  if (normalized.match(/cheveu|cheveux|tete|tête|hair/)) {
    return "Que ce soit pour une coupe, une coloration, un lissage ou un soin, on s'occupe de tout chez Élégance Paris ! ✂️ Qu'est-ce qui vous ferait plaisir ? Je peux vous donner les tarifs et vous aider à réserver.";
  }

  if (normalized.match(/cher|argent|economie|économie|promo|promotion|reduc|réduction|offre|solde/)) {
    return "Nos tarifs sont justes et transparents pour un salon de qualité au cœur de Paris 😊 La coupe homme démarre à 25€ et la coupe femme à 45€. On mise sur la qualité plutôt que le volume ! Voulez-vous voir la grille complète des tarifs ?";
  }

  if (normalized.match(/aide|aider|besoin|question|info|information|renseign/)) {
    return "Bien sûr, je suis là pour vous aider ! 😊 Je peux vous renseigner sur nos tarifs, nos horaires, notre équipe de coiffeurs, ou vous aider à prendre rendez-vous. Que souhaitez-vous savoir ?";
  }

  // Default fallback - still tries to be helpful
  return pickRandom([
    "Bonne question ! Je connais tout sur le salon Élégance Paris : nos coupes, colorations, soins, tarifs, horaires et notre équipe. 😊 Dites-moi ce qui vous intéresse et je vous renseigne !",
    "Je suis là pour tout vous dire sur Élégance Paris ! ✨ Que ce soit pour une coupe, une couleur, un soin ou juste pour connaître nos tarifs — demandez-moi, je gère !",
    "Excellente question ! Chez Élégance Paris, on propose des coupes, colorations, lissages et soins pour tous les types de cheveux ✂️ Qu'est-ce qui vous intéresserait ? Je vous donne tous les détails !",
    "Je ne suis pas sûr de bien comprendre votre demande 🤔 Mais je peux vous aider avec : nos tarifs, les horaires, la prise de RDV, ou des infos sur nos prestations. Qu'est-ce qui vous intéresse ?",
    "Hmm, pouvez-vous reformuler ? 😊 Je suis expert en tout ce qui touche au salon : coupes, colorations, soins, réservations... Dites-moi ce dont vous avez besoin !",
  ], previousReplies);
}

import { Bot, ArrowRight, CheckCircle, Crown, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export default function DemoSelector() {
  const plans = [
    {
      name: "Starter",
      price: "199",
      tagline: "L'essentiel pour démarrer",
      href: "/demo/starter",
      color: "gray",
      features: [
        "100 conversations / mois",
        "1 canal : site web",
        "Réponses texte simples",
        "Français uniquement",
        "Support email",
      ],
      notIncluded: [
        "Instagram & WhatsApp",
        "Suggestions cliquables",
        "Statistiques",
        "Multilingue",
        "Marque blanche",
      ],
      icon: <Bot size={24} />,
      bgClass: "bg-white border-gray-200 hover:border-gray-300",
      btnClass: "bg-gray-800 hover:bg-gray-700 text-white",
      badge: null,
    },
    {
      name: "Pro",
      price: "299",
      tagline: "Le plus populaire",
      href: "/demo/pro",
      color: "indigo",
      features: [
        "500 conversations / mois",
        "3 canaux : Site + Insta + WhatsApp",
        "Suggestions rapides cliquables",
        "Français + Anglais",
        "Statistiques conversations",
        "Tableau de bord",
        "Support prioritaire",
      ],
      notIncluded: [
        "Conversations illimitées",
        "Marque blanche",
        "Multi-boutiques",
      ],
      icon: <Zap size={24} />,
      bgClass: "bg-white border-indigo-200 hover:border-indigo-300 ring-2 ring-indigo-600 shadow-xl",
      btnClass: "bg-indigo-600 hover:bg-indigo-700 text-white",
      badge: "POPULAIRE",
    },
    {
      name: "Business",
      price: "499",
      tagline: "L'expérience premium complète",
      href: "/demo/business",
      color: "amber",
      features: [
        "Conversations illimitées",
        "Tous les canaux + API",
        "Multi-boutiques",
        "Marque blanche totale",
        "Support multilingue auto (4+ langues)",
        "Analytics avancés",
        "Personnalisation couleurs",
        "Account manager dédié",
        "SLA 99.9% uptime",
      ],
      notIncluded: [],
      icon: <Crown size={24} />,
      bgClass: "bg-gradient-to-br from-slate-900 to-indigo-950 border-amber-500/30 hover:border-amber-500/50 text-white",
      btnClass: "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black",
      badge: "PREMIUM",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Bot size={20} />
            </div>
            <span className="text-lg font-bold text-gray-900">ShopBot AI</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 mb-4">
            <Sparkles size={16} />
            Démos interactives
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Choisissez votre forfait et testez la démo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chaque forfait offre une expérience différente. Testez-les pour voir la vraie
            différence et choisir celui qui correspond à vos besoins.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 transition-all ${plan.bgClass}`}
            >
              {plan.badge && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold ${
                    plan.badge === "POPULAIRE"
                      ? "bg-indigo-600 text-white"
                      : "bg-gradient-to-r from-amber-500 to-yellow-500 text-black"
                  }`}
                >
                  {plan.badge}
                </span>
              )}

              <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${
                plan.name === "Business" ? "bg-amber-500/20 text-amber-400" :
                plan.name === "Pro" ? "bg-indigo-50 text-indigo-600" :
                "bg-gray-100 text-gray-600"
              }`}>
                {plan.icon}
              </div>

              <h3 className={`text-xl font-bold mb-1 ${plan.name === "Business" ? "text-white" : "text-gray-900"}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-4 ${plan.name === "Business" ? "text-gray-400" : "text-gray-500"}`}>
                {plan.tagline}
              </p>

              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.name === "Business" ? "text-white" : "text-gray-900"}`}>
                  {plan.price}€
                </span>
                <span className={plan.name === "Business" ? "text-gray-400" : "text-gray-500"}>/mois</span>
              </div>

              {/* Features incluses */}
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${plan.name === "Business" ? "text-gray-300" : "text-gray-700"}`}>
                    <CheckCircle size={15} className={`shrink-0 mt-0.5 ${
                      plan.name === "Business" ? "text-amber-400" :
                      plan.name === "Pro" ? "text-indigo-500" :
                      "text-green-500"
                    }`} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Features non incluses */}
              {plan.notIncluded.length > 0 && (
                <ul className="space-y-2 mb-6">
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                      <svg className="h-4 w-4 text-gray-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <Link
                href={plan.href}
                className={`flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-semibold transition-colors ${plan.btnClass}`}
              >
                Tester cette démo
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            Toutes les démos sont interactives — posez de vraies questions au chatbot pour voir la différence.
          </p>
        </div>
      </div>
    </div>
  );
}

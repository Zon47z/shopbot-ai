import { Bot, MessageCircle, Clock, Globe, Zap, ArrowRight, CheckCircle, Star } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Bot size={20} />
            </div>
            <span className="text-lg font-bold text-gray-900">ShopBot AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/demo"
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Voir la démo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 mb-6">
            <Zap size={16} />
            L&apos;IA qui répond à vos clients pendant que vous travaillez
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Arrêtez de perdre des clients{" "}
            <span className="text-indigo-600">parce que vous répondez trop tard</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            ShopBot AI est un assistant intelligent qui répond instantanément à vos clients
            sur votre site et WhatsApp. Tarifs, horaires, rendez-vous — il gère tout, 24h/24.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Tester la démo gratuite
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { value: "3s", label: "Temps de réponse moyen" },
              { value: "24/7", label: "Disponibilité" },
              { value: "+30%", label: "De clients en plus" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-indigo-600">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Tout ce dont votre commerce a besoin
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Un assistant IA personnalisé qui connaît votre business sur le bout des doigts.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <MessageCircle size={24} />,
              title: "Répond instantanément",
              desc: "Vos clients obtiennent une réponse en 3 secondes, pas 3 heures. Fini les messages ignorés.",
            },
            {
              icon: <Clock size={24} />,
              title: "Disponible 24/7",
              desc: "Dimanche soir, jour férié, 2h du matin — votre bot ne dort jamais et ne prend pas de vacances.",
            },
            {
              icon: <Globe size={24} />,
              title: "Multilingue",
              desc: "Répond en français, anglais, arabe, chinois... Idéal pour les zones touristiques.",
            },
            {
              icon: <Star size={24} />,
              title: "Connaît vos tarifs",
              desc: "Tarifs, horaires, services — le bot connaît tout et répond avec précision.",
            },
            {
              icon: <Zap size={24} />,
              title: "Redirige vers la réservation",
              desc: "Chaque conversation est une opportunité. Le bot guide vers la prise de rendez-vous.",
            },
            {
              icon: <CheckCircle size={24} />,
              title: "Zéro configuration",
              desc: "On s'occupe de tout. En 30 minutes votre assistant est opérationnel.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 hover:border-indigo-100 hover:shadow-md transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Tarifs simples, sans surprise</h2>
            <p className="text-gray-600">Rentabilisé dès le premier client récupéré.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "Starter",
                setup: "149",
                monthly: "49",
                desc: "Pour les petits commerces",
                features: ["100 conversations/mois", "1 canal (site web)", "Réponses personnalisées", "Support email"],
                popular: false,
              },
              {
                name: "Pro",
                setup: "249",
                monthly: "99",
                desc: "Le plus populaire",
                features: [
                  "500 conversations/mois",
                  "2 canaux (site + WhatsApp)",
                  "Réponses personnalisées",
                  "Statistiques avancées",
                  "Support prioritaire",
                ],
                popular: true,
              },
              {
                name: "Business",
                setup: "399",
                monthly: "199",
                desc: "Pour les multi-sites",
                features: [
                  "Conversations illimitées",
                  "Tous les canaux",
                  "Multi-boutiques",
                  "API personnalisée",
                  "Account manager dédié",
                ],
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 ${
                  plan.popular
                    ? "border-indigo-200 bg-white shadow-xl ring-2 ring-indigo-600 relative"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
                    Populaire
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.monthly}€</span>
                  <span className="text-gray-500">/mois</span>
                  <p className="text-sm text-gray-500 mt-1">+ {plan.setup}€ d&apos;installation</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/demo"
                  className={`block w-full rounded-xl py-2.5 text-center text-sm font-semibold transition-colors ${
                    plan.popular
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  Essayer gratuitement
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-2xl bg-indigo-600 p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Prêt à ne plus perdre de clients ?
          </h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
            Testez ShopBot AI gratuitement pendant 14 jours. Sans engagement, sans carte bancaire.
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Voir la démo
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Bot size={14} />
            </div>
            <span className="text-sm font-semibold text-gray-900">ShopBot AI</span>
          </div>
          <p className="text-xs text-gray-500">&copy; 2026 ShopBot AI. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

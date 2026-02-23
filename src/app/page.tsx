import { Phone, PhoneMissed, Clock, MessageSquare, Zap, ArrowRight, CheckCircle, Star, Shield, Wrench } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Phone size={20} />
            </div>
            <span className="text-lg font-bold text-gray-900">AlloPro AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/demo"
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Tester la démo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 mb-6">
            <Wrench size={16} />
            Pour plombiers, électriciens, serruriers et chauffagistes
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Vous êtes sur chantier.{" "}
            <span className="text-emerald-600">Qui répond à vos appels ?</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            AlloPro AI est un assistant vocal qui décroche quand vous ne pouvez pas.
            Il prend le nom du client, son problème, son adresse — et vous envoie tout par SMS.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
            >
              Écouter la démo
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
              { value: "40%", label: "des appels manqués par un artisan solo" },
              { value: "24/7", label: "Votre assistant ne dort jamais" },
              { value: "200-2000€", label: "Perdu à chaque appel raté" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-emerald-600">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Comment ça marche ?
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Rien à installer, rien à configurer. Ça marche en 3 étapes.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: "1",
              title: "Un client vous appelle",
              desc: "Vous êtes sous un évier, sur un toit, dans un tableau électrique. Vous pouvez pas décrocher.",
              icon: <PhoneMissed size={28} />,
            },
            {
              step: "2",
              title: "L'assistant décroche",
              desc: "Après 3 sonneries, AlloPro répond : \"Bonjour, vous êtes chez [votre nom]. Comment puis-je vous aider ?\"",
              icon: <Phone size={28} />,
            },
            {
              step: "3",
              title: "Vous recevez un SMS",
              desc: "Nom, adresse, problème, urgence — tout résumé par SMS. Vous rappelez quand vous êtes dispo.",
              icon: <MessageSquare size={28} />,
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mx-auto mb-4">
                {item.icon}
              </div>
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-bold mb-3">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Mieux qu&apos;un répondeur. Moins cher qu&apos;une secrétaire.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Phone size={24} />,
                title: "Décroche en 3 sonneries",
                desc: "Pas de messagerie, pas de \"laissez un message\". L'assistant PARLE au client, comme un vrai humain.",
              },
              {
                icon: <Clock size={24} />,
                title: "Disponible 24h/24, 7j/7",
                desc: "Le soir, le week-end, les jours fériés — votre assistant ne prend jamais de vacances.",
              },
              {
                icon: <MessageSquare size={24} />,
                title: "SMS récapitulatif",
                desc: "Nom, adresse, problème, urgence — tout arrive par SMS. Vous rappelez quand vous êtes prêt.",
              },
              {
                icon: <Star size={24} />,
                title: "Personnalisé à votre nom",
                desc: "\"Bonjour, vous êtes chez Dupont Plomberie\" — le client pense parler à votre assistant personnel.",
              },
              {
                icon: <Shield size={24} />,
                title: "Ne donne jamais de prix",
                desc: "L'assistant prend les infos, mais c'est VOUS qui donnez le devis. Pas de surprise pour le client.",
              },
              {
                icon: <Zap size={24} />,
                title: "Zéro configuration",
                desc: "On s'occupe de tout. Vous activez juste le renvoi d'appel sur votre téléphone. 10 minutes max.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 hover:border-emerald-100 hover:shadow-md transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Comparez</h2>
        </div>
        <div className="max-w-3xl mx-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500"></th>
                <th className="text-center py-3 px-4 font-medium text-gray-400">Répondeur</th>
                <th className="text-center py-3 px-4 font-medium text-gray-400">Secrétaire</th>
                <th className="text-center py-3 px-4 font-semibold text-emerald-600">AlloPro AI</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Décroche et parle au client", rep: false, sec: true, us: true },
                { label: "Disponible 24h/24, 7j/7", rep: false, sec: false, us: true },
                { label: "Envoie un SMS récapitulatif", rep: false, sec: false, us: true },
                { label: "Jamais malade / en vacances", rep: true, sec: false, us: true },
                { label: "Coût mensuel", rep: "0€", sec: "800-1500€", us: "à partir de 79€" },
              ].map((row) => (
                <tr key={row.label} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">{row.label}</td>
                  <td className="py-3 px-4 text-center">
                    {typeof row.rep === "boolean" ? (
                      row.rep ? <CheckCircle size={18} className="text-green-500 mx-auto" /> : <span className="text-red-400">✕</span>
                    ) : (
                      <span className="text-gray-600">{row.rep}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {typeof row.sec === "boolean" ? (
                      row.sec ? <CheckCircle size={18} className="text-green-500 mx-auto" /> : <span className="text-red-400">✕</span>
                    ) : (
                      <span className="text-gray-600">{row.sec}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {typeof row.us === "boolean" ? (
                      row.us ? <CheckCircle size={18} className="text-emerald-500 mx-auto" /> : <span className="text-red-400">✕</span>
                    ) : (
                      <span className="font-semibold text-emerald-600">{row.us}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Tarifs simples</h2>
            <p className="text-gray-600">Moins cher qu&apos;un seul client perdu.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "Essentiel",
                setup: "49",
                monthly: "79",
                desc: "Pour les artisans solo",
                features: [
                  "50 appels/mois",
                  "SMS récapitulatif",
                  "Personnalisé à votre nom",
                  "Support email",
                ],
                popular: false,
              },
              {
                name: "Pro",
                setup: "99",
                monthly: "149",
                desc: "Le plus populaire",
                features: [
                  "150 appels/mois",
                  "SMS récapitulatif",
                  "Personnalisé à votre nom",
                  "Détection d'urgence",
                  "Tableau de bord",
                  "Support prioritaire",
                ],
                popular: true,
              },
              {
                name: "Premium",
                setup: "149",
                monthly: "249",
                desc: "Pour les équipes",
                features: [
                  "Appels illimités",
                  "SMS + Email récapitulatif",
                  "Multi-numéros",
                  "Statistiques avancées",
                  "WhatsApp intégré",
                  "Account manager dédié",
                ],
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 ${
                  plan.popular
                    ? "border-emerald-200 bg-white shadow-xl ring-2 ring-emerald-600 relative"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-1 text-xs font-semibold text-white">
                    Populaire
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.monthly}€</span>
                  <span className="text-gray-500">/mois</span>
                  <p className="text-sm text-gray-500 mt-1">+ {plan.setup}€ de mise en place</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/demo"
                  className={`block w-full rounded-xl py-2.5 text-center text-sm font-semibold transition-colors ${
                    plan.popular
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  Tester la démo
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-2xl bg-emerald-600 p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Chaque appel manqué, c&apos;est un client perdu.
          </h2>
          <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
            Testez AlloPro AI maintenant. Parlez à l&apos;assistant comme un vrai client
            et voyez par vous-même.
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            Écouter la démo
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Phone size={14} />
            </div>
            <span className="text-sm font-semibold text-gray-900">AlloPro AI</span>
          </div>
          <p className="text-xs text-gray-500">&copy; 2026 AlloPro AI. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

import { Compass, Handshake, ShieldCheck, Sparkles } from "lucide-react";
import PublicNavbar from "./PublicNavbar.jsx";
import LandingFooter from "../../components/landing/LandingFooter.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";
import ScrollReveal from "../../components/ui/ScrollReveal.jsx";
const milestones = [
  [
    "2022",
    "A trusted room",
    "A small circle of founders begins exchanging meaningful introductions.",
  ],
  [
    "2023",
    "Chapters take shape",
    "Local trust expands into a structured, accountable community.",
  ],
  [
    "2025",
    "The network compounds",
    "Cross-chapter referrals turn relationships into measurable value.",
  ],
  [
    "2026",
    "10,000 strong",
    "A new standard for professional networking emerges.",
  ],
];
export default function AboutPage() {
  return (
    <div className="public-page">
      <PublicNavbar />
      <main>
        <section className="content-shell public-page-top text-center">
          <p className="eyebrow">Home &gt; About</p>
          <h1 className="mt-5 text-5xl font-bold sm:text-7xl">
            Relationships are the{" "}
            <span className="text-gradient">real infrastructure.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#b3b3b3]">
            We are building the trusted layer where ambitious professionals
            meet, exchange value, and grow together.
          </p>
        </section>
        <section className="section-solid section-pad">
          <div className="content-shell grid items-center gap-12 lg:grid-cols-2">
            <ScrollReveal direction="left">
              <p className="eyebrow">Our mission</p>
              <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
                Make every professional connection count.
              </h2>
              <p className="mt-6 leading-8 text-[#b3b3b3]">
                Networkers replaces noisy networking with verified communities,
                clear accountability, and a system built around meaningful
                introductions.
              </p>
              <blockquote className="about-quote mt-8 border-l-2 border-red-500 bg-red-600/10 p-6 text-3xl font-semibold">
                “Trust grows when value moves in both directions.”
              </blockquote>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div className="image-frame aspect-[4/3] rounded-3xl">
                <img
                  className="h-full w-full object-cover"
                  src="/gallery/networkers11.jpeg"
                  alt="Networkers community members together"
                />
              </div>
            </ScrollReveal>
          </div>
        </section>
        <section className="content-shell section-pad">
          <ScrollReveal>
            <p className="eyebrow text-center">Our story</p>
            <h2 className="mt-3 text-center text-4xl font-bold">
              Built one trusted introduction at a time.
            </h2>
          </ScrollReveal>
          <div className="relative mx-auto mt-14 max-w-4xl before:absolute before:bottom-0 before:left-4 before:top-0 before:w-px before:bg-gradient-to-b before:from-red-500 before:via-red-900 before:to-transparent md:before:left-1/2">
            {milestones.map(([year, title, copy], i) => (
              <ScrollReveal
                direction={i % 2 ? "right" : "left"}
                key={year}
                className={`relative mb-8 pl-12 md:w-1/2 ${i % 2 ? "md:ml-auto md:pl-12" : "md:pr-12 md:text-right"}`}
              >
                <span
                  aria-hidden="true"
                  className={`milestone-dot absolute top-6 ${i % 2 ? "left-[10px] md:-left-[8px]" : "left-[10px] md:left-auto md:-right-[8px]"}`}
                />
                <GlowCard>
                  <p className="font-data text-sm text-red-400">{year}</p>
                  <h3 className="mt-2 text-xl font-bold">{title}</h3>
                  <p className="mt-3 leading-7 text-[#b3b3b3]">{copy}</p>
                </GlowCard>
              </ScrollReveal>
            ))}
          </div>
        </section>
        <section className="section-solid section-pad">
          <div className="content-shell">
            <p className="eyebrow">Core values</p>
            <div className="mt-10 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [
                  ShieldCheck,
                  "Trust",
                  "Verified people and accountable action.",
                ],
                [Handshake, "Reciprocity", "Give value before expecting it."],
                [Compass, "Intent", "Every interaction has a purpose."],
                [Sparkles, "Ambition", "Growth is better when it is shared."],
              ].map(([Icon, t, c], i) => (
                <ScrollReveal className="h-full" delay={i * 70} key={t}>
                  <GlowCard className="h-full">
                    <Icon className="text-red-500" />
                    <h3 className="mt-5 text-xl font-bold">{t}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#b3b3b3]">{c}</p>
                  </GlowCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

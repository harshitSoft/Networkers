import { Search, Send, Sprout, Users } from "lucide-react";
import { Reveal } from "./Motion.jsx";

const steps = [
  [Search, "01", "Discover", "Find relevant business owners based on industry, services, and location."],
  [Users, "02", "Connect", "Build trusted professional relationships with businesses that complement yours."],
  [Send, "03", "Refer", "Share qualified client opportunities with the right business in your network."],
  [Sprout, "04", "Grow", "Track referrals from first contact to converted business."]
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-3xl">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Networking That Actually Creates Business</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">From first connection to converted client, Networkers keeps the entire business relationship visible.</p>
        </Reveal>
        <div className="relative mt-14 grid gap-5 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-[#1E3A8A] via-[#0D9488] to-[#D8580E] lg:block" />
          {steps.map(([Icon, number, title, copy], index) => (
            <Reveal key={title} delay={index * 0.08} className="relative rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-[#1E3A8A] text-white shadow-lg"><Icon size={24} /></div>
              <p className="mt-6 text-sm font-black text-[#D8580E]">Step {number}</p>
              <h3 className="mt-2 text-2xl font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import { CalendarCheck, ChartNoAxesCombined, Handshake, Network, Radar, Route } from "lucide-react";
import { Reveal } from "./Motion.jsx";

const features = [
  [Network, "Trusted Business Network", "Connect with real business owners and build meaningful professional relationships.", "lg:col-span-2"],
  [Handshake, "Qualified Client Referrals", "Share genuine client requirements with businesses capable of delivering the service.", ""],
  [Route, "Referral Tracking", "Know exactly what happened to every client opportunity you shared.", ""],
  [CalendarCheck, "Professional Meetups", "Discover networking events and connect with attendees before the meetup.", "lg:row-span-2"],
  [Radar, "Business Opportunities", "Find requirements and collaboration opportunities across the network.", ""],
  [ChartNoAxesCombined, "Measurable Growth", "Understand how much business your professional network is generating.", "lg:col-span-2"]
];

export default function FeatureBento() {
  return (
    <section className="px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-3xl">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Why Business Owners Choose Networkers</h2>
        </Reveal>
        <div className="mt-10 grid auto-rows-[minmax(220px,auto)] gap-5 lg:grid-cols-4">
          {features.map(([Icon, title, copy, span], index) => (
            <Reveal key={title} delay={index * 0.05} className={`group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${span}`}>
              <Icon className="h-12 w-12 rounded-lg bg-blue-50 p-2 text-[#1E3A8A]" />
              <h3 className="mt-5 text-2xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{copy}</p>
              <div className="mt-6 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] transition group-hover:w-full" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

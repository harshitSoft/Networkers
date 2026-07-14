import { BriefcaseBusiness } from "lucide-react";
import { Reveal } from "./Motion.jsx";

const opportunities = [
  ["Looking for ERP Development Partner", "Posted by RK Constructions", "Budget: ₹5L - ₹8L", "Technology"],
  ["Need Digital Marketing Agency", "Posted by UrbanSpace Realty", "Budget: ₹50K/month", "Marketing"],
  ["Interior Designer Required for Commercial Project", "Posted by BuildCore Developers", "Location: Indore", "Interior Design"]
];

export default function OpportunityPreview() {
  return (
    <section className="bg-white px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-4xl">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Opportunities Are Everywhere. The Right Network Helps You Find Them.</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {opportunities.map(([title, by, detail, category], index) => (
            <Reveal key={title} delay={index * 0.08} className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-6 shadow-sm">
              <BriefcaseBusiness className="h-11 w-11 rounded-lg bg-orange-50 p-2 text-[#D8580E]" />
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-2 text-sm font-bold text-slate-500">{by}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">{detail}</span>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-[#0D9488]">{category}</span>
              </div>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-[#1E3A8A]">View Opportunity</button>
                <button className="rounded-lg bg-[#0D9488] px-3 py-2 text-sm font-black text-white">I'm Interested</button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

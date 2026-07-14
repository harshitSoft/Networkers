import { ArrowDown, CheckCircle2 } from "lucide-react";
import { Reveal } from "./Motion.jsx";

const benefits = ["Share qualified client leads", "Track every referral", "See real business generated", "Strengthen trusted relationships"];
const flow = ["RK Constructions", "Client needs ERP software", "Referral Sent", "TechNova Solutions", "Client Contacted", "Meeting Scheduled", "Proposal Sent", "₹5,00,000 Business Converted"];

export default function ReferralFlow() {
  return (
    <section id="referrals" className="bg-white px-4 py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-black text-[#D8580E]">Referral engine</span>
          <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Never Let a Good Client Opportunity Go to Waste.</h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">When a client needs a service you do not provide, connect them with a trusted business in your network. Share the referral, track its progress, and see the business value created through your relationship.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm font-bold">
                <CheckCircle2 size={18} className="text-[#0D9488]" /> {benefit}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-[1.5rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-teal-50 p-5 shadow-glow">
            <div className="grid gap-3">
              {flow.map((item, index) => (
                <div key={`${item}-${index}`}>
                  <div className={`rounded-lg border p-4 shadow-sm ${index === flow.length - 1 ? "border-teal-200 bg-[#0D9488] text-white" : "border-white bg-white text-slate-800"}`}>
                    <p className="text-sm font-black">{item}</p>
                  </div>
                  {index < flow.length - 1 && <ArrowDown className="mx-auto my-1 text-[#1E3A8A]" size={18} />}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

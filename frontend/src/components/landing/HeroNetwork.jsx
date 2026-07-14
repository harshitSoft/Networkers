import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Reveal } from "./Motion.jsx";

const cards = [
  { name: "Rohit Sharma", company: "BuildCore Constructions", tag: "Construction Company", services: "Commercial Building, Renovation", x: "6%", y: "14%" },
  { name: "Amit Verma", company: "GrowthEdge Marketing", tag: "Marketing Agency", services: "SEO, Branding, Ads", x: "58%", y: "10%" },
  { name: "Vikas Jain", company: "Jain Finance Advisory", tag: "Finance Consultant", services: "Tax, Business Loans", x: "60%", y: "66%" },
  { name: "Rahul Mehta", company: "StudioArc Interiors", tag: "Interior Design Firm", services: "Office Interior, Home Design", x: "5%", y: "70%" }
];

const labels = [
  ["New Referral", "left-[42%] top-[12%]"],
  ["₹5L Business Generated", "right-3 top-[45%]"],
  ["Meeting Accepted", "left-[10%] top-[48%]"],
  ["New Connection", "left-[42%] bottom-[10%]"]
];

export default function HeroNetwork() {
  return (
    <section id="hero" className="relative isolate overflow-hidden px-4 pb-20 pt-32 sm:pt-36 lg:pb-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(13,148,136,0.18),transparent_28%),radial-gradient(circle_at_80%_8%,rgba(30,58,138,0.20),transparent_30%),linear-gradient(135deg,#F8FAFC_0%,#EFF6FF_48%,#F0FDFA_100%)]" />
      <div className="landing-dot-field absolute inset-0 -z-10 opacity-60" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.94fr_1.06fr]">
        <Reveal>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-sm font-bold text-[#0D9488] shadow-sm">
              <Sparkles size={16} className="text-[#D8580E]" /> India's Business Networking Ecosystem
            </span>
            <h1 className="mt-6 text-5xl font-black leading-[1.02] tracking-tight text-[#0F172A] sm:text-6xl lg:text-7xl">
              Your Next <span className="bg-gradient-to-r from-[#1E3A8A] via-[#0D9488] to-[#D8580E] bg-clip-text text-transparent">Business Opportunity</span> Is Already in Your Network.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Connect with trusted business owners, exchange qualified client referrals, discover opportunities, and turn professional relationships into real business growth.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="landing-cta bg-[#0D9488] text-white hover:bg-[#0b8178]">
                Join the Network <ArrowRight size={18} />
              </Link>
              <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} className="landing-cta border border-slate-200 bg-white text-[#1E3A8A] hover:border-teal-200 hover:bg-teal-50">
                See How It Works
              </button>
            </div>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {["2,500+ Business Owners", "3,200+ Referrals Shared", "₹10Cr+ Business Generated"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg border border-white bg-white/80 px-3 py-3 text-sm font-bold text-slate-700 shadow-sm">
                  <CheckCircle2 size={17} className="shrink-0 text-[#0D9488]" /> {item}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative min-h-[520px] sm:min-h-[600px]">
          <div className="absolute inset-0 rounded-[2rem] border border-white/80 bg-white/55 shadow-[0_28px_90px_rgba(30,58,138,0.18)] backdrop-blur-xl" />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 640 600" aria-hidden="true">
            <defs>
              <linearGradient id="networkLine" x1="0" x2="1">
                <stop stopColor="#1E3A8A" stopOpacity=".35" />
                <stop offset="1" stopColor="#0D9488" stopOpacity=".75" />
              </linearGradient>
            </defs>
            {[[320, 300, 120, 120], [320, 300, 505, 105], [320, 300, 515, 430], [320, 300, 125, 455]].map(([x1, y1, x2, y2], index) => (
              <g key={index}>
                <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#networkLine)" strokeWidth="3" strokeDasharray="9 10" animate={{ opacity: [0.35, 0.85, 0.35] }} transition={{ duration: 2.6, repeat: Infinity, delay: index * 0.25 }} />
                <motion.circle r="5" fill="#D8580E" initial={{ cx: x1, cy: y1 }} animate={{ cx: [x1, x2], cy: [y1, y2] }} transition={{ duration: 2.6, repeat: Infinity, delay: index * 0.35, ease: "easeInOut" }} />
              </g>
            ))}
          </svg>
          <div className="absolute left-1/2 top-1/2 z-10 w-[205px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-blue-100 bg-white p-4 text-center shadow-2xl sm:w-[250px] sm:p-5">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#1E3A8A] text-lg font-black text-white">HN</div>
            <h2 className="mt-3 text-xl font-black text-slate-950">Harshit Nigam</h2>
            <p className="font-bold text-[#1E3A8A]">TechNova Solutions</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">IT Company</p>
            <p className="mt-2 text-xs font-bold text-slate-500">Services: Websites, ERP, Mobile Apps</p>
          </div>
          {cards.map((card, index) => (
            <motion.div key={card.name} className="absolute z-10 w-[150px] rounded-lg border border-slate-200 bg-white p-3 shadow-xl sm:w-[210px] sm:p-4" style={{ left: card.x, top: card.y }} animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: index * 0.35, ease: "easeInOut" }}>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-teal-50 font-black text-[#0D9488]">{card.name.split(" ").map((part) => part[0]).join("")}</div>
                <div>
                  <h3 className="text-sm font-black text-slate-950">{card.name}</h3>
                  <p className="text-xs font-bold text-slate-500">{card.company}</p>
                </div>
              </div>
              <p className="mt-3 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#1E3A8A]">{card.tag}</p>
              <p className="mt-2 text-xs font-semibold text-slate-500">Services: {card.services}</p>
            </motion.div>
          ))}
          {labels.map(([label, pos]) => (
            <motion.span key={label} className={`absolute z-20 rounded-full border border-white bg-white/90 px-3 py-2 text-xs font-black text-[#D8580E] shadow-lg ${pos}`} animate={{ y: [0, -6, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}>
              {label}
            </motion.span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

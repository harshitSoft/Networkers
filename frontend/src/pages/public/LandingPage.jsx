import { ArrowRight, BarChart3, CalendarDays, Handshake, Network, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import PublicNavbar from "./PublicNavbar.jsx";
import LandingFooter from "../../components/landing/LandingFooter.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";

const sections = [
  ["Trusted chapters", "Verified business owners join subscription chapters built around local trust.", Users],
  ["Referral exchange", "Members can send client work to the best-fit member across any chapter.", Handshake],
  ["Revenue tracking", "Confirmed deals become measurable business given and business earned.", BarChart3]
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A]">
      <PublicNavbar />
      <main>
        <section className="bg-gradient-to-br from-[#1A1A1A] via-[#4D4D4D] to-[#B91C1C] px-4 py-16 text-white sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-red-100">Subscription chapter business community</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">Grow Your Business Through Trusted Chapter Networking</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-red-50">Join a verified business community where members exchange referrals, attend events, and generate measurable business revenue through trusted relationships.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-red-700 transition hover:-translate-y-0.5" to="/chapters">Explore Chapters <ArrowRight size={17} /></Link>
                <Link className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/10" to="/login">Login</Link>
              </div>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur">
              <div className="grid gap-3">
                {["Qualified referrals", "Chapter events", "Revenue reports", "Admin-managed membership"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg bg-white/15 p-4">
                    <ShieldCheck size={20} />
                    <span className="font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 py-14 md:grid-cols-3">
          {sections.map(([title, copy, Icon]) => (
            <GlowCard as="article" key={title}>
              <Icon className="text-red-700" size={28} />
              <h2 className="mt-4 text-xl font-black">{title}</h2>
              <p className="mt-2 leading-7 text-slate-600">{copy}</p>
            </GlowCard>
          ))}
        </section>

        <section className="bg-white px-4 py-14">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-black">Referral process built for real work</h2>
              <p className="mt-3 leading-7 text-slate-600">A member receives a client requirement, searches by category, chapter, location, or name, and sends the referral to the right member. The receiver accepts, progresses the status, confirms the amount, and both dashboards update.</p>
            </div>
            <div>
              <h2 className="text-3xl font-black">Community events and updates</h2>
              <p className="mt-3 leading-7 text-slate-600">Admins manage upcoming events, completed event galleries, chapter subscriptions, and member access from one workspace.</p>
            </div>
          </div>
        </section>

        <section className="px-4 py-14">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-2xl bg-[#4D4D4D] p-8 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-black">Ready to join a chapter?</h2>
              <p className="mt-2 text-red-100">Membership is verified and created by an admin.</p>
            </div>
            <Link className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-red-700 transition hover:-translate-y-0.5" to="/chapters">Contact Admin to Join <Network size={17} /></Link>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

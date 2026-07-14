import { CalendarDays, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal } from "./Motion.jsx";

export default function MeetupPreview() {
  return (
    <section id="meetups" className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0D9488] px-4 py-20 text-white sm:py-24">
      <div className="landing-network-bg absolute inset-0 opacity-25" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Online Connections. Real Business Conversations.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-50">Discover professional networking meetups, see who is attending, and connect with relevant business owners before you even enter the room.</p>
          <div className="mt-8 rounded-lg border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <h3 className="text-2xl font-black">Indore Business Networking Meetup</h3>
            <div className="mt-5 grid gap-3 text-sm font-bold text-blue-50 sm:grid-cols-2">
              <p className="flex items-center gap-2"><CalendarDays size={18} /> 20 July 2026</p>
              <p className="flex items-center gap-2"><Users size={18} /> 45 Business Owners Joining</p>
              <p>6:00 PM - 9:00 PM</p>
              <p className="flex items-center gap-2"><MapPin size={18} /> Indore</p>
            </div>
            <div className="mt-5 flex -space-x-3">
              {["RS", "AV", "VJ", "HN", "RM"].map((item) => <span key={item} className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#1E3A8A] bg-white text-xs font-black text-[#1E3A8A]">{item}</span>)}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Construction", "Technology", "Finance", "Marketing", "Real Estate"].map((tag) => <span key={tag} className="rounded-full bg-white/14 px-3 py-1 text-xs font-bold">{tag}</span>)}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="landing-cta bg-white text-[#1E3A8A] hover:bg-blue-50">View Meetup</Link>
              <Link to="/register" className="landing-cta border border-white/30 text-white hover:bg-white/10">Join Network</Link>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-lg border border-white/15 bg-white p-6 text-slate-950 shadow-2xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#D8580E]">People You Should Meet</p>
            <div className="mt-6 grid gap-4">
              {["Rohit Sharma - Construction", "Amit Verma - Marketing", "Vikas Jain - Finance"].map((person) => (
                <div key={person} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                  <span className="font-black">{person}</span>
                  <span className="h-3 w-3 rounded-full bg-[#0D9488] shadow-[0_0_0_6px_rgba(13,148,136,0.14)]" />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

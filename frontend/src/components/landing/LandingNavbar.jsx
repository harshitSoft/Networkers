import { Menu, Network, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const links = [
  ["Home", "hero"],
  ["How It Works", "how-it-works"],
  ["Referrals", "referrals"],
  ["Network", "network"],
  ["Meetups", "meetups"]
];

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navClass = scrolled
    ? "border-slate-200/80 bg-white/88 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl"
    : "border-white/60 bg-white/55 backdrop-blur-md";

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4">
      <nav className={`mx-auto flex max-w-7xl items-center justify-between rounded-full border px-4 py-3 transition-all duration-300 ${navClass}`}>
        <button onClick={() => scrollToSection("hero")} className="group flex items-center gap-2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0D9488]">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#1E3A8A] text-white shadow-glow">
            <Network size={20} />
          </span>
          <span className="text-lg font-black tracking-tight text-[#1E3A8A]">Networkers</span>
        </button>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map(([label, id]) => (
            <button key={id} onClick={() => scrollToSection(id)} className="rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-teal-50 hover:text-[#0D9488] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488]">
              {label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="rounded-full px-4 py-2 text-sm font-bold text-[#1E3A8A] transition hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488]">Login</Link>
          <Link to="/register" className="rounded-full bg-[#0D9488] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-700/18 transition hover:-translate-y-0.5 hover:bg-[#0b8178] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D8580E]">Join Network</Link>
        </div>

        <button aria-label="Open menu" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-[#1E3A8A] md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488]">
          <Menu size={20} />
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 p-4 backdrop-blur-sm md:hidden">
          <div className="ml-auto max-w-sm rounded-lg bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-[#1E3A8A]">Networkers</span>
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="mt-6 grid gap-2">
              {links.map(([label, id]) => (
                <button key={id} onClick={() => { scrollToSection(id); setOpen(false); }} className="rounded-lg px-3 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50">
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-3">
              <Link to="/login" className="btn-muted rounded-full">Login</Link>
              <Link to="/register" className="btn-primary rounded-full bg-[#0D9488] hover:bg-[#0b8178]">Join Network</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

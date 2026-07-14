import { Network } from "lucide-react";

const columns = [
  ["Platform", ["Business Network", "Referrals", "Opportunities", "Meetups"]],
  ["Company", ["About", "How It Works", "Contact"]],
  ["Legal", ["Privacy Policy", "Terms of Service"]]
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#E8262A] text-white"><Network size={21} /></span>
            <span className="text-2xl font-black text-[#1A1A1A]">Network<span className="text-[#E8262A]">ers</span></span>
          </div>
          <p className="mt-4 max-w-md leading-7 text-slate-600">A professional business networking ecosystem built for connections, referrals, meetups, and real business growth.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map(([title, items]) => (
            <div key={title}>
              <h3 className="font-black text-slate-950">{title}</h3>
              <div className="mt-4 grid gap-3">
                {items.map((item) => <a key={item} href="#hero" className="text-sm font-semibold text-slate-500 transition hover:text-[#E8262A]">{item}</a>)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-slate-200 pt-6 text-sm font-semibold text-slate-500">Copyright 2026 Networkers. All rights reserved.</div>
    </footer>
  );
}

import { ArrowRight, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const columns = [
  ["Product", ["Chapters", "Referrals", "Events", "Community"]],
  ["Company", ["About", "Leadership", "Contact", "Careers"]],
  ["Resources", ["Help center", "Privacy", "Terms", "Cookies"]]
];

export default function LandingFooter() {
  return (
    <footer className="relative border-t border-red-500/20 bg-brand-base/95 px-4 py-14 text-brand-primary">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.35fr_2fr]">
        <div>
          <Link to="/" aria-label="Networkers home" className="group flex w-[205px] items-center">
            <img src="/brand/networkers-logo-light.png" alt="Networkers" className="h-auto w-[205px] object-contain transition duration-300 group-hover:scale-[1.02] dark:hidden" />
            <img src="/brand/networkers-logo-dark.png" alt="" aria-hidden="true" className="hidden h-auto w-[205px] origin-center scale-[1.9] object-contain transition duration-300 group-hover:scale-[1.95] dark:block" />
          </Link>
          <p className="mt-5 max-w-sm leading-7 text-brand-muted">Where ambitious professionals turn trusted relationships into measurable growth.</p>
          <div className="mt-6 flex gap-3">
            {[Linkedin, Instagram].map((Icon, i) => <button key={i} aria-label="Social link" className="grid h-11 w-11 place-items-center rounded-full border border-brand-border/40 text-brand-muted transition hover:border-red-500 hover:text-red-400 hover:shadow-[0_0_20px_rgba(225,6,0,.3)]"><Icon size={18} /></button>)}
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map(([title, items]) => <div key={title}><h3 className="text-sm font-bold uppercase tracking-[.12em] text-brand-primary">{title}</h3><div className="mt-5 grid gap-3">{items.map(item => <a href="#" key={item} className="text-sm text-brand-muted transition hover:text-red-400">{item}</a>)}</div></div>)}
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-5 border-t border-red-500/20 pt-6 text-sm text-brand-muted md:flex-row md:items-center md:justify-between">
        <span>© 2026 Networkers. All rights reserved.</span>
        <form className="flex max-w-sm gap-2" onSubmit={e => e.preventDefault()}><input aria-label="Newsletter email" className="field !py-2" placeholder="Email for network insights" /><button className="glow-button glow-button-primary !min-h-0 !p-3" aria-label="Subscribe"><ArrowRight size={18} /></button></form>
      </div>
    </footer>
  );
}

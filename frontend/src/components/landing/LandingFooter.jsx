import { Link } from "react-router-dom";

const columns = [
  ["Explore", [["Chapters", "/chapters"], ["Events", "/events"], ["Gallery", "/gallery"]]],
  ["Company", [["About us", "/about"], ["Privacy policy", "/privacy-policy"], ["Home", "/"]]],
  ["Account", [["Join a chapter", "/join"], ["Member login", "/login"]]],
];

export default function LandingFooter() {
  return (
    <footer className="relative border-t border-red-500/20 bg-brand-base/95 px-4 py-14 text-brand-primary">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.35fr_2fr]">
        <div>
          <Link
            to="/"
            aria-label="Networkers home"
            className="group flex w-[205px] items-center"
          >
            <img
              src="/brand/networkers-logo-light.png"
              alt="Networkers"
              className="h-auto w-[205px] object-contain transition duration-300 group-hover:scale-[1.02] dark:hidden"
            />
            <img
              src="/brand/networkers-logo-dark.png"
              alt=""
              aria-hidden="true"
              className="hidden h-auto w-[205px] origin-center scale-[1.9] object-contain transition duration-300 group-hover:scale-[1.95] dark:block"
            />
          </Link>
          <p className="mt-5 max-w-sm leading-7 text-brand-muted">
            Where ambitious professionals turn trusted relationships into
            measurable growth.
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="grid grid-cols-2 gap-8 sm:grid-cols-3"
        >
          {columns.map(([title, items]) => (
            <div key={title}>
              <h3 className="text-sm font-bold uppercase tracking-[.12em] text-brand-primary">
                {title}
              </h3>
              <div className="mt-5 grid gap-3">
                {items.map(([label, to]) => (
                  <Link
                    to={to}
                    key={to}
                    className="text-sm text-brand-muted transition hover:text-red-400"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl border-t border-red-500/20 pt-6 text-sm text-brand-muted">
        <span>© 2026 Networkers. All rights reserved.</span>
      </div>
    </footer>
  );
}

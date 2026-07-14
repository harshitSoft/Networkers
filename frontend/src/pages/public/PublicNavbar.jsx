import { Link, NavLink } from "react-router-dom";

export default function PublicNavbar() {
  const links = [["/", "Home"], ["/about", "About Us"], ["/chapters", "Chapters"], ["/events", "Events"], ["/gallery", "Gallery"]];
  return (
    <header className="sticky top-0 z-30 border-b border-red-100 bg-white/95 px-4 py-3 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link to="/" className="text-xl font-black text-[#1A1A1A]">Network<span className="text-[#E8262A]">ers</span></Link>
        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold ${isActive ? "bg-red-50 text-red-700" : "text-[#1A1A1A] hover:bg-red-50"}`}>{label}</NavLink>
          ))}
          <Link to="/login" className="ml-1 whitespace-nowrap rounded-full bg-[#E8262A] px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#B91C1C]">Login</Link>
        </div>
      </nav>
    </header>
  );
}

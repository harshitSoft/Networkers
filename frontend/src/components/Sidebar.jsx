import { BarChart3, CalendarDays, Handshake, Home, LayoutDashboard, LogOut, Network, Send, Shield, Users, UserCircle, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export const userLinks = [
  ["/dashboard", "Dashboard", Home],
  ["/give-referral", "Give Referral", Send],
  ["/referrals/received", "Referrals Received", Handshake],
  ["/referrals/given", "Referrals Given", Send],
  ["/members", "Members", Users],
  ["/user/chapters", "Chapters", Network],
  ["/user/events", "Events", CalendarDays],
  ["/profile", "Profile", UserCircle]
];

export const adminLinks = [
  ["/admin", "Admin Dashboard", Shield],
  ["/admin/users", "Users", Users],
  ["/admin/users/create", "Create User", Users],
  ["/admin/chapters", "Chapters", Network],
  ["/admin/events", "Events", CalendarDays],
  ["/admin/referrals", "Referrals", Handshake],
  ["/admin/revenue-analytics", "Revenue Analytics", BarChart3]
];

export default function Sidebar({ mobile = false, open = false, onClose }) {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const links = isAdmin ? adminLinks : userLinks;
  const sidebar = (
    <aside className={`${mobile ? "flex h-full w-80 max-w-[85vw] flex-col" : "fixed inset-y-0 left-0 hidden w-64 lg:flex lg:flex-col"} border-r border-white/10 bg-[#1A1A1A] p-4 text-white`}>
      <div className="mb-6 flex items-center justify-between rounded-2xl bg-white/10 p-4">
        <div>
          <p className="text-2xl font-black">Networkers</p>
          <p className="mt-1 text-sm text-slate-300">Trusted business growth</p>
        </div>
        {mobile && <button aria-label="Close menu" className="rounded-lg p-2 text-slate-200 hover:bg-white/10" onClick={onClose}><X size={20} /></button>}
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {links.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} end={to === "/admin"} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-[#E8262A] text-white shadow-sm shadow-red-900/30" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
            <Icon size={17} /> <span className="min-w-0 truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
      <button className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white" onClick={() => { logout(); onClose?.(); navigate("/"); }}>
        <LogOut size={17} /> Logout
      </button>
    </aside>
  );

  if (!mobile) return sidebar;

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-slate-950/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div className={`absolute inset-y-0 left-0 transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebar}
      </div>
    </div>
  );
}

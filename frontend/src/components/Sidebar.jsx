import { BarChart3, CalendarDays, Handshake, Home, Network, Newspaper, Send, Shield, Users, UserCircle, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import LogoutButton from "./LogoutButton.jsx";

export const userLinks = [["/community","Community Stories",Newspaper],["/public-dashboard","Community Dashboard",BarChart3],["/dashboard","My Analytics",Home],["/give-referral","Give Referral",Send],["/referrals/received","Referrals Received",Handshake],["/referrals/given","Referrals Given",Send],["/meetings","Monthly Meeting",CalendarDays],["/user/chapters","Browse Chapters",Network],["/user/events","Chapter Events",CalendarDays],["/profile","Profile",UserCircle]];
export const adminLinks = [["/admin","Command Center",Shield],["/admin/users/create","Create User",Users],["/admin/chapters","Chapters",Network],["/admin/events","Events",CalendarDays],["/admin/monthly-meetings","Monthly Meetings",CalendarDays],["/admin/referrals","Referrals",Handshake],["/admin/revenue-analytics","Analytics",BarChart3],["/profile","My Profile",UserCircle]];

export default function Sidebar({ mobile = false, open = false, onClose }) {
  const { isAdmin, user } = useAuth();
  const links = isAdmin ? adminLinks : userLinks;
  const close = () => onClose?.();
  const panel = <aside className={`${mobile ? "flex h-full w-80 max-w-[88vw] flex-col" : "fixed inset-y-0 left-0 hidden w-[272px] lg:flex lg:flex-col"} dashboard-sidebar z-40 p-4`}>
    <div className="mb-8 flex items-center justify-between px-2 py-3"><Link to={isAdmin ? "/admin" : "/dashboard"} onClick={close} aria-label="Networkers dashboard" className="group flex w-[180px] shrink-0 items-center"><img src="/brand/networkers-logo-light.png" alt="Networkers" className="h-auto w-[180px] object-contain transition duration-300 group-hover:scale-[1.02] dark:hidden"/><img src="/brand/networkers-logo-dark.png" alt="" aria-hidden="true" className="hidden h-auto w-[180px] origin-center scale-[1.9] object-contain transition duration-300 group-hover:scale-[1.95] dark:block"/></Link>{mobile && <button type="button" aria-label="Close menu" className="glass-icon" onClick={close}><X size={19}/></button>}</div>
    <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">{links.map(([to,label,Icon]) => <NavLink key={to} to={to} end={to === "/admin" || to === "/dashboard"} onClick={close} className={({isActive}) => `dashboard-nav-item ${isActive ? "active" : ""}`}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
    <div className="mt-5 rounded-2xl border border-white/[.07] bg-white/[.025] p-3"><div className="flex items-center gap-3"><div className="h-10 w-10 overflow-hidden rounded-full border border-red-500/40 bg-red-500/10">{user?.profileImage ? <img className="h-full w-full object-cover" src={user.profileImage} alt={user.fullName}/> : <span className="grid h-full place-items-center font-bold text-red-400">{user?.fullName?.[0]}</span>}</div><div className="min-w-0"><p className="truncate text-sm font-bold">{user?.fullName}</p><p className="text-[10px] uppercase tracking-wider text-red-400">{user?.role}</p></div></div><LogoutButton className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10" onConfirmed={close}/></div>
  </aside>;
  if (!mobile) return panel;
  return <div className={`mobile-sidebar-overlay fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}><div className={`absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={close}/><div className={`mobile-sidebar-drawer absolute inset-y-0 left-0 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>{panel}</div></div>;
}

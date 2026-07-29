import { Bell, Menu, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import LogoutButton from "./LogoutButton.jsx";

const titles = { dashboard: "My Analytics", "public-dashboard": "Community Dashboard", community: "Community Stories", admin: "Admin Analytics", users: "Users", chapters: "Chapters", events: "Events", meetings: "Face to Face", "monthly-meetings": "Face to Face", profile: "Profile", received: "Referrals Received", given: "Referrals Given" };

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const segment = location.pathname.split("/").filter(Boolean).at(-1) || "dashboard";
  const title = titles[segment] || segment.replaceAll("-", " ");
  return <header className="dashboard-header sticky top-0 z-30 px-3 py-3 sm:px-6"><div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3"><button aria-label="Open dashboard menu" className="glass-icon lg:hidden" onClick={onMenuClick}><Menu size={19}/></button><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#888]">Dashboard / <span className="text-red-400">{title}</span></p><h1 className="truncate text-lg font-bold capitalize text-white sm:text-xl">{title}</h1></div></div>
    <div className="flex items-center gap-2 sm:gap-3"><button className="glass-icon" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={toggleTheme}>{theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}</button><Link to="/notifications" className="glass-icon relative" aria-label="Notifications"><Bell size={18}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_#ff1e1e]"/></Link><Link to="/profile" className="h-10 w-10 overflow-hidden rounded-full border border-red-500/40 bg-red-500/10 transition hover:shadow-[0_0_20px_rgba(225,6,0,.4)]">{user?.profileImage ? <img src={user.profileImage} alt={user.fullName} className="h-full w-full object-cover"/> : <span className="grid h-full place-items-center font-bold text-red-400">{user?.fullName?.[0]}</span>}</Link><LogoutButton iconOnly className="glass-icon hidden sm:grid"/></div>
  </div></header>;
}

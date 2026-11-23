import { Bell, Lightbulb, Menu, Moon, Sun, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { tipApi } from "../api/tipApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import LogoutButton from "./LogoutButton.jsx";

const titles = { dashboard: "My Analytics", "public-dashboard": "Community Dashboard", community: "Community Stories", admin: "Admin Analytics", users: "Users", chapters: "Chapters", events: "Events", meetings: "Face to Face", "monthly-meetings": "Face to Face", profile: "Profile", received: "Referrals Received", given: "Referrals Given" };

export default function Navbar({ onMenuClick }) {
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [tipsOpen, setTipsOpen] = useState(false);
  const [tipCategory, setTipCategory] = useState("ALL");
  const [tips, setTips] = useState([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  useEffect(() => { if (!tipsOpen) return; setTipsLoading(true); tipApi.published(tipCategory).then(setTips).catch(() => setTips([])).finally(() => setTipsLoading(false)); }, [tipsOpen, tipCategory]);
  useEffect(() => setTipsOpen(false), [location.pathname]);
  const segment = location.pathname.split("/").filter(Boolean).at(-1) || "dashboard";
  const title = titles[segment] || segment.replaceAll("-", " ");
  return <header className="dashboard-header sticky top-0 z-30 px-3 py-3 sm:px-6"><div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3"><button aria-label="Open dashboard menu" className="glass-icon lg:hidden" onClick={onMenuClick}><Menu size={19}/></button><h1 className="truncate text-lg font-bold capitalize text-white sm:text-xl">{title}</h1></div>
    <div className="relative flex items-center gap-2 sm:gap-3">{isAdmin && <Link to="/admin/tips" className="glass-icon hidden sm:grid" aria-label="Manage tips"><Lightbulb size={18}/></Link>}<button type="button" className="glass-icon" aria-label="Tips and updates" aria-expanded={tipsOpen} onClick={()=>{setTipCategory("ALL");setTipsOpen(v=>!v)}}><Lightbulb size={18}/></button>{tipsOpen&&<div className="absolute right-0 top-12 z-50 w-[min(92vw,420px)] overflow-hidden rounded-2xl border border-brand-border/20 bg-brand-panel p-4 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-bold">Tips &amp; Updates</h2><button className="glass-icon !h-8 !w-8" aria-label="Close tips" onClick={()=>setTipsOpen(false)}><X size={16}/></button></div><div className="mt-3 flex flex-wrap gap-1.5">{[["ALL","All Categories"],["NETWORKING","Networking"],["MEMBERSHIP","Membership"],["BNI_TECH","BNI Tech"]].map(([key,name])=><button key={key} onClick={()=>setTipCategory(key)} className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tipCategory===key?"border-red-500 bg-red-500/15 text-red-300":"border-brand-border/20 text-brand-muted"}`} aria-pressed={tipCategory===key}>{name}</button>)}</div><div className="mt-3 max-h-72 space-y-2 overflow-auto">{tipsLoading?<p className="py-5 text-center text-sm text-brand-muted">Loading tips…</p>:tips.length?tips.slice(0,5).map(t=><Link key={t.id} to={`/tips/${t.id}`} className="block rounded-xl border border-brand-border/10 p-3 hover:border-red-500/30"><span className="text-[10px] font-bold uppercase tracking-wide text-red-300">{t.category?.replace("_"," ")}</span><p className="mt-1 font-semibold">{t.title}</p><p className="mt-1 line-clamp-2 text-xs text-brand-muted">{t.shortDescription}</p></Link>):<p className="py-5 text-center text-sm text-brand-muted">No published tips in this category.</p>}</div><Link to="/tips" className="mt-3 block border-t border-brand-border/10 pt-3 text-center text-sm font-bold text-red-300">View all tips →</Link></div>}<button className="glass-icon" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={toggleTheme}>{theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}</button><Link to="/notifications" className="glass-icon relative" aria-label="Notifications"><Bell size={18}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_#ff1e1e]"/></Link><Link to="/profile" className="h-10 w-10 overflow-hidden rounded-full border border-red-500/40 bg-red-500/10 transition hover:shadow-[0_0_20px_rgba(225,6,0,.4)]">{user?.profileImage ? <img src={user.profileImage} alt={user.fullName} className="h-full w-full object-cover"/> : <span className="grid h-full place-items-center font-bold text-red-400">{user?.fullName?.[0]}</span>}</Link><LogoutButton iconOnly className="glass-icon grid"/></div>
  </div></header>;
}





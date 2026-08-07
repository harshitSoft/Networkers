import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";

export default function PublicNavbar() {
  const [open,setOpen]=useState(false); const [scrolled,setScrolled]=useState(false);
  const {theme,toggleTheme}=useTheme();
  useEffect(()=>{const fn=()=>setScrolled(window.scrollY>100);fn();window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn)},[]);
  const links=[["/","Home"],["/about","About"],["/chapters","Chapters"],["/events","Events"],["/gallery","Gallery"],["/privacy-policy","Privacy"]];
  return <header className={`sticky top-0 z-40 border-b border-brand-border/20 bg-brand-base/90 px-4 text-brand-primary transition-all duration-300 backdrop-blur-xl ${scrolled?"shadow-[0_8px_35px_rgba(225,6,0,.12)]":""}`}>
    <nav className="mx-auto flex h-[74px] max-w-7xl items-center justify-between">
      <Link to="/" aria-label="Networkers home" className="group flex shrink-0 items-center">
        <img src="/brand/networkers-logo-light.png" alt="Networkers" className="h-auto w-[155px] object-contain transition duration-300 group-hover:scale-[1.02] sm:w-[205px] dark:hidden"/>
        <img src="/brand/networkers-logo-dark.png" alt="" aria-hidden="true" className="hidden h-auto w-[155px] origin-center scale-[1.9] object-contain transition duration-300 group-hover:scale-[1.95] sm:w-[205px] dark:block"/>
      </Link>
      <div className="hidden items-center gap-1 xl:flex">{links.map(([to,label])=><NavLink key={to} to={to} className={({isActive})=>`nav-link rounded-full px-4 py-2 text-sm font-semibold ${isActive?"active":""}`}>{label}</NavLink>)}</div>
      <div className="hidden items-center gap-3 xl:flex"><button onClick={toggleTheme} aria-label={`Switch to ${theme==="dark"?"light":"dark"} mode`} className="glass-icon relative overflow-hidden">{theme==="dark"?<Sun className="animate-[spin_.3s_ease]" size={18}/>:<Moon size={18}/>}</button><Link to="/login" className="glow-button glow-button-secondary !min-h-0 !px-5 !py-2">Sign in</Link><Link to="/join" className="glow-button glow-button-primary !min-h-0 !px-5 !py-2">Join now</Link></div>
      <div className="flex gap-2 xl:hidden"><button onClick={toggleTheme} aria-label="Toggle theme" className="glass-icon">{theme==="dark"?<Sun size={18}/>:<Moon size={18}/>}</button><button aria-label="Open navigation" onClick={()=>setOpen(true)} className="grid h-11 w-11 place-items-center rounded-full border border-red-500/40 text-red-500"><Menu/></button></div>
    </nav>
    {open&&<div className="public-mobile-menu-overlay fixed inset-0 z-50 xl:hidden" onClick={()=>setOpen(false)}><div className="public-mobile-menu ml-auto h-full w-[82%] max-w-sm border-l-2 p-6 shadow-2xl" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><span className="text-xl font-bold text-red-600">Networkers</span><button aria-label="Close navigation" onClick={()=>setOpen(false)} className="public-mobile-menu-button grid h-11 w-11 place-items-center rounded-full border"><X/></button></div><div className="mt-10 grid gap-3">{links.map(([to,label])=><NavLink onClick={()=>setOpen(false)} key={to} to={to} className="public-mobile-menu-link rounded-xl border px-4 py-4 text-lg font-semibold">{label}</NavLink>)}<Link to="/login" onClick={()=>setOpen(false)} className="public-mobile-menu-action mt-4 rounded-xl border px-4 py-3 text-center font-bold">Sign in</Link><Link to="/join" onClick={()=>setOpen(false)} className="public-mobile-menu-action rounded-xl border px-4 py-3 text-center font-bold">Join now</Link></div></div></div>}
  </header>;
}

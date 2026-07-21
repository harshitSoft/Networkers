import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";

export default function PublicNavbar() {
  const [open,setOpen]=useState(false); const [scrolled,setScrolled]=useState(false);
  const {theme,toggleTheme}=useTheme();
  useEffect(()=>{const fn=()=>setScrolled(window.scrollY>100);fn();window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn)},[]);
  const links=[["/","Home"],["/about","About"],["/chapters","Chapters"],["/events","Events"],["/gallery","Gallery"]];
  return <header className={`sticky top-0 z-40 border-b border-brand-border/20 bg-brand-base/90 px-4 text-brand-primary transition-all duration-300 backdrop-blur-xl ${scrolled?"shadow-[0_8px_35px_rgba(225,6,0,.12)]":""}`}>
    <nav className="mx-auto flex h-[74px] max-w-7xl items-center justify-between">
      <Link to="/" aria-label="Networkers home" className="group flex shrink-0 items-center">
        <img src="/brand/networkers-logo-light.png" alt="Networkers" className="h-auto w-[155px] object-contain transition duration-300 group-hover:scale-[1.02] sm:w-[205px] dark:hidden"/>
        <img src="/brand/networkers-logo-dark.png" alt="" aria-hidden="true" className="hidden h-auto w-[155px] origin-center scale-[1.9] object-contain transition duration-300 group-hover:scale-[1.95] sm:w-[205px] dark:block"/>
      </Link>
      <div className="hidden items-center gap-1 md:flex">{links.map(([to,label])=><NavLink key={to} to={to} className={({isActive})=>`nav-link rounded-full px-4 py-2 text-sm font-semibold ${isActive?"active":""}`}>{label}</NavLink>)}</div>
      <div className="hidden items-center gap-3 md:flex"><button onClick={toggleTheme} aria-label={`Switch to ${theme==="dark"?"light":"dark"} mode`} className="glass-icon relative overflow-hidden">{theme==="dark"?<Sun className="animate-[spin_.3s_ease]" size={18}/>:<Moon size={18}/>}</button><Link to="/login" className="glow-button glow-button-secondary !min-h-0 !px-5 !py-2">Sign in</Link><Link to="/join" className="glow-button glow-button-primary !min-h-0 !px-5 !py-2">Join now</Link></div>
      <div className="flex gap-2 md:hidden"><button onClick={toggleTheme} aria-label="Toggle theme" className="glass-icon">{theme==="dark"?<Sun size={18}/>:<Moon size={18}/>}</button><button aria-label="Open navigation" onClick={()=>setOpen(true)} className="grid h-11 w-11 place-items-center rounded-full border border-red-500/40 text-red-500"><Menu/></button></div>
    </nav>
    {open&&<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden" onClick={()=>setOpen(false)}><div className="ml-auto h-full w-[82%] max-w-sm border-l border-red-500/30 bg-[#0d0d0d] p-6" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><span className="text-xl font-bold">Network<span className="text-red-500">ers</span></span><button aria-label="Close navigation" onClick={()=>setOpen(false)} className="grid h-11 w-11 place-items-center rounded-full border border-white/10"><X/></button></div><div className="mt-10 grid gap-3">{links.map(([to,label])=><NavLink onClick={()=>setOpen(false)} key={to} to={to} className="rounded-xl border border-white/5 px-4 py-4 text-lg font-semibold hover:border-red-500/40 hover:text-red-400">{label}</NavLink>)}<Link to="/login" className="glow-button glow-button-secondary mt-4">Sign in</Link><Link to="/join" className="glow-button glow-button-primary">Join now</Link></div></div></div>}
  </header>;
}

import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { BellRing, CreditCard, X } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { notificationApi } from "../api/notificationApi.js";

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location=useLocation();
  const {user,isAdmin}=useAuth();const[alerts,setAlerts]=useState([]);
  useEffect(()=>{if(isAdmin||!user)return;notificationApi.all().then(items=>{const referral=(items||[]).find(n=>!n.read&&n.title?.toLowerCase().includes("new referral"));if(referral)addAlerts([{id:`referral_${referral.id}`,icon:BellRing,title:"You received a new referral",message:"A member shared a new business referral with you. Please check it out.",to:"/referrals/received",key:`referral_alert_${referral.id}`}])}).catch(()=>{});const end=user.subscriptionEndDate?new Date(`${user.subscriptionEndDate}T00:00:00`):null;if(end){const days=Math.ceil((end-new Date())/86400000);if(days>=0&&days<=30)addAlerts([{id:"subscription",icon:CreditCard,title:"Subscription renewal reminder",message:`Your subscription expires ${days===0?"today":`in ${days} day${days===1?"":"s"}`}. Please renew it to keep your membership active.`,to:"/profile",key:`subscription_alert_${user.id}_${user.subscriptionEndDate}`}])}},[user?.id,isAdmin]);
  function addAlerts(items){const fresh=items.filter(a=>!sessionStorage.getItem(a.key));if(!fresh.length)return;fresh.forEach(a=>{sessionStorage.setItem(a.key,"1");window.setTimeout(()=>setAlerts(v=>v.filter(x=>x.id!==a.id)),5000)});setAlerts(v=>[...v,...fresh.filter(a=>!v.some(x=>x.id===a.id))])}
  useEffect(()=>{setMenuOpen(false)},[location.pathname]);
  useEffect(()=>{document.body.style.overflow=menuOpen?"hidden":"";const close=e=>{if(e.key==="Escape")setMenuOpen(false)};window.addEventListener("keydown",close);return()=>{document.body.style.overflow="";window.removeEventListener("keydown",close)}},[menuOpen]);
  return (
    <div className="dashboard-shell min-h-screen overflow-x-hidden text-white">
      <Sidebar />
      <Sidebar mobile open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="fixed right-4 top-20 z-50 flex w-[min(92vw,390px)] flex-col gap-3">{alerts.map(a=><div key={a.id} className="rounded-2xl border border-red-500/30 bg-[#151515] p-4 text-white shadow-[0_18px_60px_rgba(0,0,0,.5)]"><div className="flex gap-3"><a.icon className="mt-0.5 shrink-0 text-red-500" size={22}/><div className="min-w-0 flex-1"><p className="font-bold">{a.title}</p><p className="mt-1 text-sm leading-6 text-[#b3b3b3]">{a.message}</p><Link className="mt-2 inline-block text-sm font-bold text-red-400" to={a.to} onClick={()=>setAlerts(v=>v.filter(x=>x.id!==a.id))}>Check now →</Link></div><button aria-label="Close notification" onClick={()=>setAlerts(v=>v.filter(x=>x.id!==a.id))}><X size={17}/></button></div></div>)}</div>
      <div className="min-w-0 lg:pl-[272px]">
        <Navbar onMenuClick={() => setMenuOpen(true)} />
        <main className="relative z-10 mx-auto min-w-0 max-w-[1440px] p-3 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

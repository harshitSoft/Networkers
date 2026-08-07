import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { BellRing, Cake, CreditCard, X } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { notificationApi } from "../api/notificationApi.js";
import { eventApi } from "../api/eventApi.js";
import { authApi } from "../api/authApi.js";
import Loader from "../components/Loader.jsx";

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pageLoading,setPageLoading]=useState(false);
  const location=useLocation();
  const {user,isAdmin}=useAuth();const[alerts,setAlerts]=useState([]);
  useEffect(()=>{if(isAdmin||!user)return;authApi.todaysBirthdays().then(items=>addAlerts((items||[]).map(member=>({id:`birthday_${member.id}`,icon:Cake,title:`Happy Birthday, ${member.fullName}!`,message:"The Networkers community wishes you a wonderful birthday and a successful year ahead.",key:`birthday_${new Date().toISOString().slice(0,10)}_${member.id}`})))).catch(()=>{});notificationApi.all().then(items=>{const referral=(items||[]).find(n=>!n.read&&n.title?.toLowerCase().includes("new referral"));if(referral)addAlerts([{id:`referral_${referral.id}`,icon:BellRing,title:"You received a new referral",message:"A member shared a new business referral with you. Please check it out.",to:"/referrals/received",key:`referral_alert_${referral.id}`}])}).catch(()=>{});Promise.all([eventApi.upcoming(),eventApi.myRsvps()]).then(([events,rsvps])=>{const invited=(events||[]).filter(event=>(!event.chapter||String(event.chapter.id)===String(user.chapterId)||event.chapter.chapterName===user.chapterName)&&!rsvps[event.id]);addAlerts(invited.map(event=>({id:`event_${event.id}`,icon:BellRing,title:`You are invited: ${event.title}`,message:`${event.eventDate}${event.eventTime?` at ${event.eventTime}`:""}${event.location?` · ${event.location}`:""}`,to:"/user/events",key:`event_invitation_${user.id}_${event.id}`}))) }).catch(()=>{});const end=user.subscriptionEndDate?new Date(`${user.subscriptionEndDate}T00:00:00`):null;if(end){const days=Math.ceil((end-new Date())/86400000);if(days>=0&&days<=30)addAlerts([{id:"subscription",icon:CreditCard,title:"Subscription renewal reminder",message:`Your subscription expires ${days===0?"today":`in ${days} day${days===1?"":"s"}`}. Please renew it to keep your membership active.`,to:"/profile",key:`subscription_alert_${user.id}_${user.subscriptionEndDate}`}])}},[user?.id,isAdmin]);
  function addAlerts(items){const fresh=items.filter(a=>!sessionStorage.getItem(a.key));if(!fresh.length)return;fresh.forEach(a=>{sessionStorage.setItem(a.key,"1");window.setTimeout(()=>setAlerts(v=>v.filter(x=>x.id!==a.id)),5000)});setAlerts(v=>[...v,...fresh.filter(a=>!v.some(x=>x.id===a.id))])}
  useEffect(()=>{setMenuOpen(false);setPageLoading(true);const timer=setTimeout(()=>setPageLoading(false),280);return()=>clearTimeout(timer)},[location.pathname]);
  useEffect(()=>{document.body.style.overflow=menuOpen?"hidden":"";const close=e=>{if(e.key==="Escape")setMenuOpen(false)};window.addEventListener("keydown",close);return()=>{document.body.style.overflow="";window.removeEventListener("keydown",close)}},[menuOpen]);
  return (
    <div className="dashboard-shell min-h-screen overflow-x-hidden text-white">
      <Sidebar />
      <Sidebar mobile open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="fixed right-4 top-20 z-50 flex w-[min(92vw,350px)] flex-col gap-3">{alerts.map(a=><div key={a.id} className="birthday-alert rounded-2xl border border-red-500/30 bg-brand-panel p-4 text-brand-primary shadow-[0_18px_60px_rgba(0,0,0,.5)]"><div className="flex gap-3"><a.icon className="mt-0.5 shrink-0 text-red-500" size={22}/><div className="min-w-0 flex-1"><p className="font-bold">{a.title}</p><p className="mt-1 text-sm leading-6 text-brand-muted">{a.message}</p>{a.to&&<Link className="mt-2 inline-block text-sm font-bold text-red-400" to={a.to} onClick={()=>setAlerts(v=>v.filter(x=>x.id!==a.id))}>Check now →</Link>}</div><button aria-label="Close notification" onClick={()=>setAlerts(v=>v.filter(x=>x.id!==a.id))}><X size={17}/></button></div></div>)}</div>
      <div className="min-w-0 lg:pl-[272px]">
        <Navbar onMenuClick={() => setMenuOpen(true)} />
        <main className="relative z-10 mx-auto min-w-0 max-w-[1440px] p-3 sm:p-6 lg:p-8">
          {pageLoading?<Loader label="Loading page"/>:<Outlet />}
        </main>
      </div>
    </div>
  );
}

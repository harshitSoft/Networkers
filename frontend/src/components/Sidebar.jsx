import {BarChart3,CalendarDays,ChevronDown,ClipboardList,Handshake,Home,Image,Network,Newspaper,Send,Shield,UserRoundPlus,Users,UserCircle,X} from "lucide-react";
import {Link,NavLink,useLocation} from "react-router-dom";
import {useEffect,useState} from "react";
import {useAuth} from "../context/AuthContext.jsx";
import LogoutButton from "./LogoutButton.jsx";

export const userLinks=[
  ["/dashboard","My Analytics",Home],
  ["/business/profiles","Business Profiles",Users],
  ["/meetings","Face to Face",CalendarDays],
  ["/user/chapters","Chapters",Network],
  ["/user/events","Chapter Events",CalendarDays],
  ["/profile","Profile",UserCircle],
];
export const communityLinks=[["/community","Community Stories",Newspaper],["/public-dashboard","Community Dashboard",BarChart3]];
export const referralLinks=[["/give-referral","Give Referral",Send],["/referrals/received","Referrals Received",Handshake],["/referrals/given","Referrals Given",Send]];
export const adminLinks=[["/admin/revenue-analytics","Analytics",BarChart3],["/admin","Command Center",Shield],["/admin/visitors","Manage Visitors",UserRoundPlus],["/admin/visitors/details","Visitor Details",ClipboardList],["/admin/members/create","Create Member",Users],["/admin/gallery","Event Gallery",Image],["/admin/user-control","User Control",Shield],["/admin/chapters","Chapters",Network],["/admin/events","Events",CalendarDays],["/admin/event-fees","Event Fees",Handshake],["/admin/monthly-meetings","Face to Face",CalendarDays],["/admin/referrals","Referrals",Handshake],["/profile","My Profile",UserCircle]];

export default function Sidebar({mobile=false,open=false,onClose}){
  const{isAdmin,user}=useAuth();const location=useLocation();const close=()=>onClose?.();
  const[expanded,setExpanded]=useState(()=>({community:communityLinks.some(([to])=>location.pathname===to),referrals:referralLinks.some(([to])=>location.pathname.startsWith(to))}));
  useEffect(()=>{if(communityLinks.some(([to])=>location.pathname===to))setExpanded(v=>({...v,community:true}));if(referralLinks.some(([to])=>location.pathname.startsWith(to)))setExpanded(v=>({...v,referrals:true}))},[location.pathname]);
  const panel=<aside className={`${mobile?"flex h-full w-80 max-w-[88vw] flex-col":"fixed inset-y-0 left-0 hidden w-[272px] lg:flex lg:flex-col"} dashboard-sidebar z-40 p-4`}>
    <div className="mb-6 flex items-center justify-between px-2 py-3"><Link to={isAdmin?"/admin":"/dashboard"} onClick={close} aria-label="Networkers dashboard" className="group flex w-[180px] shrink-0 items-center"><img src="/brand/networkers-logo-light.png" alt="Networkers" className="h-auto w-[180px] object-contain transition duration-300 group-hover:scale-[1.02] dark:hidden"/><img src="/brand/networkers-logo-dark.png" alt="" aria-hidden="true" className="hidden h-auto w-[180px] origin-center scale-[1.9] object-contain transition duration-300 group-hover:scale-[1.95] dark:block"/></Link>{mobile&&<button type="button" aria-label="Close menu" className="glass-icon" onClick={close}><X size={19}/></button>}</div>
    <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">{isAdmin?adminLinks.map(link=><SidebarLink key={link[0]} item={link} close={close}/>):<><CollapsibleNav title="Community" icon={Newspaper} links={communityLinks} open={expanded.community} onToggle={()=>setExpanded(v=>({...v,community:!v.community}))} close={close}/><NavDivider/><CollapsibleNav title="Referrals" icon={Handshake} links={referralLinks} open={expanded.referrals} onToggle={()=>setExpanded(v=>({...v,referrals:!v.referrals}))} close={close}/><NavDivider/>{userLinks.map(link=><SidebarLink key={link[0]} item={link} close={close}/>)}</>}</nav>
    <div className="mt-5 rounded-2xl border border-white/[.07] bg-white/[.025] p-3"><div className="flex items-center gap-3"><div className="h-10 w-10 overflow-hidden rounded-full border border-red-500/40 bg-red-500/10">{user?.profileImage?<img className="h-full w-full object-cover" src={user.profileImage} alt={user.fullName}/>:<span className="grid h-full place-items-center font-bold text-red-400">{user?.fullName?.[0]}</span>}</div><div className="min-w-0"><p className="truncate text-sm font-bold">{user?.fullName}</p><p className="text-[10px] uppercase tracking-wider text-red-400">{user?.role}</p></div></div><LogoutButton className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10" onConfirmed={close}/></div>
  </aside>;
  if(!mobile)return panel;
  return <div className={`mobile-sidebar-overlay fixed inset-0 z-50 lg:hidden ${open?"":"pointer-events-none"}`} aria-hidden={!open}><div className={`absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${open?"opacity-100":"opacity-0"}`} onClick={close}/><div className={`mobile-sidebar-drawer absolute inset-y-0 left-0 transition-transform duration-300 ${open?"translate-x-0":"-translate-x-full"}`}>{panel}</div></div>
}

function CollapsibleNav({title,icon:Icon,links,open,onToggle,close}){
  const location=useLocation();const active=links.some(([to])=>location.pathname===to||location.pathname.startsWith(`${to}/`));
  return <section className={`overflow-hidden rounded-2xl border transition-all duration-300 ${active||open?"border-red-500/25 bg-red-500/[.055] shadow-[inset_0_0_24px_rgba(225,6,0,.035)]":"border-white/[.06] bg-white/[.02]"}`}>
    <button type="button" onClick={onToggle} aria-expanded={open} className={`flex min-h-12 w-full items-center gap-3 px-3 text-left text-sm font-bold transition duration-300 ${active?"text-red-400":"text-[#aaa] hover:bg-red-500/[.07] hover:text-white"}`}><Icon size={18} className="transition duration-300"/><span className="flex-1">{title}</span><ChevronDown size={17} className={`transition-transform duration-300 ease-out ${open?"rotate-180 text-red-400":""}`}/></button>
    <div className={`grid transition-all duration-300 ease-out ${open?"grid-rows-[1fr] opacity-100":"grid-rows-[0fr] opacity-0"}`}><div className="min-h-0 overflow-hidden"><div className="space-y-1 border-t border-red-500/10 p-2">{links.map(link=><SidebarLink key={link[0]} item={link} close={close} nested/>)}</div></div></div>
  </section>
}
function SidebarLink({item:[to,label,Icon],close,nested=false}){return <NavLink to={to} end={to==="/admin"||to==="/dashboard"||to==="/admin/visitors"} onClick={close} className={({isActive})=>`dashboard-nav-item ${nested?"!min-h-10 !py-2 !pl-3 text-xs":""} ${isActive?"active":""}`}><Icon size={nested?16:18}/><span>{label}</span></NavLink>}
function NavDivider(){return <div className="h-2" aria-hidden="true"/>}

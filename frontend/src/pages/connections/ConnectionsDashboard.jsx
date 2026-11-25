import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe2, Handshake, Inbox, Send, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { connectionApi } from "../../api/connectionApi";
import { Avatar } from "./MemberDirectory.jsx";

export default function ConnectionsDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { connectionApi.dashboard().then(setData).catch(() => toast.error("Could not load connections")); }, []);
  if (!data) return <div className="page-shell grid gap-4 sm:grid-cols-2"><div className="card h-32 animate-pulse"/><div className="card h-32 animate-pulse"/></div>;
  const stats = [["Total connections", data.totalConnections, Handshake, "/connections"], ["New in 30 days", data.newConnections, Sparkles, "/connections"], ["Requests received", data.receivedPending, Inbox, "/connections?tab=received"], ["Requests sent", data.sentPending, Send, "/connections?tab=sent"]];
  return <div className="page-shell space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="page-kicker">Your global network</p><h1 className="page-title">Connections <span className="text-brand-accent">Dashboard</span></h1><p className="mt-2 text-sm text-brand-muted">Build professional relationships across Networkers.</p></div><Link className="btn-primary" to="/connections/discover"><Globe2 size={17}/>Discover members</Link></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value, Icon, to]) => <Link key={label} to={to} className="card flex items-center gap-4 p-5 transition hover:border-red-500/40"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-500/10 text-red-500"><Icon/></span><span><span className="block text-2xl font-black">{value}</span><span className="text-sm text-brand-muted">{label}</span></span></Link>)}</section>
    <section className="grid gap-5 lg:grid-cols-2"><Panel title="Suggested members" href="/connections/discover" empty="We’ll show relevant members here as the directory grows.">{data.suggestions?.map((m) => <MemberLine key={m.id} member={m}/>)}</Panel><Panel title="Recent connections" href="/connections" empty="Accepted connections will appear here.">{data.recentConnections?.map((m) => <MemberLine key={m.id} member={m}/>)}</Panel></section>
    <div className="grid gap-3 sm:grid-cols-2"><Link to="/connections?tab=received" className="card flex items-center justify-between p-5 font-bold">Review received requests <ArrowRight size={18}/></Link><Link to="/connections?tab=sent" className="card flex items-center justify-between p-5 font-bold">Manage sent requests <ArrowRight size={18}/></Link></div>
  </div>;
}
function Panel({ title, href, empty, children }) { return <section className="card p-5"><div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-black">{title}</h2><Link className="text-sm font-bold text-red-600" to={href}>View all</Link></div>{children?.length ? <div className="divide-y divide-brand-border/20">{children}</div> : <p className="py-6 text-sm text-brand-muted">{empty}</p>}</section>; }
function MemberLine({ member }) { return <Link to={`/connections/members/${member.id}`} className="flex items-center gap-3 py-3"><Avatar member={member}/><span className="min-w-0 flex-1"><b className="block truncate">{member.fullName}</b><small className="block truncate text-brand-muted">{member.businessName || member.chapterName || "Networkers Member"}</small></span><ArrowRight size={17} className="text-brand-muted"/></Link>; }

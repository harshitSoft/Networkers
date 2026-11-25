import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapPin, Search } from "lucide-react";
import toast from "react-hot-toast";
import { connectionApi } from "../../api/connectionApi";
import EmptyState from "../../components/EmptyState.jsx";
import { Avatar } from "./MemberDirectory.jsx";

const tabs = [["network", "My Connections"], ["received", "Received Requests"], ["sent", "Sent Requests"]];
export default function MyNetwork() {
  const [params, setParams] = useSearchParams();
  const [active, setActive] = useState(params.get("tab") || "network");
  const [data, setData] = useState({ network: [], received: [], sent: [] });
  const [networkInfo, setNetworkInfo] = useState({ page: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [query, setQuery] = useState("");
  const [networkTerm, setNetworkTerm] = useState("");
  const [page, setPage] = useState(0);
  const currentUser = useMemo(() => JSON.parse(localStorage.getItem("networkers_user") || "null"), []);
  const load = () => { setLoading(true); Promise.all([connectionApi.networkPage({ page, size: 20, q: networkTerm }), connectionApi.received(), connectionApi.sent()]).then(([network, received, sent]) => { setData({ network: network?.content || [], received, sent }); setNetworkInfo(network || { page: 0, totalPages: 0, totalElements: 0 }); }).catch(() => toast.error("Could not load connections")).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, [page, networkTerm]);
  useEffect(() => { const timer = setTimeout(() => { setNetworkTerm(query); setPage(0); }, 300); return () => clearTimeout(timer); }, [query]);
  useEffect(() => { const tab = params.get("tab"); if (tabs.some(([key]) => key === tab)) setActive(tab); }, [params]);
  function select(key) { setActive(key); setParams(key === "network" ? {} : { tab: key }); }
  async function action(id, method, success) { setBusy((s) => ({ ...s, [id]: true })); try { await connectionApi[method](id); toast.success(success); load(); } catch (error) { toast.error(error.response?.data?.message || "Could not update connection"); } finally { setBusy((s) => ({ ...s, [id]: false })); } }
  async function remove(id) { if (!window.confirm("Remove this connection from your network?")) return; await action(id, "remove", "Connection removed"); }
  const visible = data[active] || [];
  return <div className="page-shell space-y-5"><header><p className="page-kicker">Global connections</p><h1 className="page-title">My <span className="text-brand-accent">Network</span></h1><p className="mt-2 text-sm text-brand-muted">Manage your professional connections and requests.</p></header>
    <section className="card p-4"><div className="flex flex-wrap gap-2">{tabs.map(([key,label]) => <button key={key} onClick={() => select(key)} className={`rounded-full px-4 py-2 text-sm font-bold ${active === key ? "bg-[#E8262A] text-white" : "border border-red-200 bg-white text-red-700 hover:bg-red-50"}`}>{label}{key === "received" && data.received.length > 0 ? ` · ${data.received.length}` : ""}</button>)}</div>
      {active === "network" && <label className="relative mt-4 block max-w-lg"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={17}/><input className="field !pl-10" placeholder="Search your connections" value={query} onChange={(e) => setQuery(e.target.value)}/></label>}</section>
    {loading ? <div className="grid gap-4 md:grid-cols-2"><div className="card h-48 animate-pulse"/><div className="card h-48 animate-pulse"/></div> : visible.length ? <div className="grid gap-4 md:grid-cols-2">{visible.map((c) => {
      const member = other(c, currentUser?.id);
      return <article className="card p-5" key={c.id}><div className="flex items-start gap-3"><Avatar member={member}/><div className="min-w-0 flex-1"><Link to={`/connections/members/${member?.id}`} className="truncate text-lg font-black hover:text-red-600">{member?.fullName}</Link><p className="truncate text-sm font-semibold text-red-600">{member?.profession || member?.category || "Networkers Member"}</p><p className="truncate text-sm text-brand-muted">{member?.businessName || "Business profile"}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${active === "network" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{active === "network" ? "Connected" : c.status === "PENDING" ? "Pending" : c.status}</span></div>
        <p className="mt-3 flex gap-2 text-sm text-brand-muted"><MapPin size={16}/>{[member?.city,member?.state,member?.country].filter(Boolean).join(", ") || "Location not listed"} · {member?.chapterName || "Networkers"}</p>
        {c.message && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">“{c.message}”</p>}
        <p className="mt-3 text-xs text-brand-muted">{active === "network" ? `Connected since ${new Date(c.respondedAt || c.updatedAt || c.createdAt).toLocaleDateString()}` : `Requested ${new Date(c.createdAt).toLocaleDateString()}`}</p>
        <div className="mt-4 flex flex-wrap gap-2"><Link className="btn-muted" to={`/connections/members/${member?.id}${active === "received" ? `?requestId=${c.id}` : ""}`}>View profile</Link>{active === "network" ? <button className="btn-muted text-red-600" disabled={busy[c.id]} onClick={() => remove(c.id)}>Remove connection</button> : active === "received" ? <><button className="btn-primary" disabled={busy[c.id]} onClick={() => action(c.id,"accept","Connection accepted")}>Accept</button><button className="btn-muted" disabled={busy[c.id]} onClick={() => action(c.id,"reject","Request rejected")}>Reject</button></> : <button className="btn-muted" disabled={busy[c.id]} onClick={() => action(c.id,"cancel","Request withdrawn")}>Withdraw request</button>}</div>
      </article>;
    })}</div> : <EmptyState title={active === "network" ? "No connections yet" : active === "received" ? "No received requests" : "No sent requests"} message={active === "network" ? "Discover members from any Networkers chapter to start building your professional network." : "Connection requests will appear here when there is activity."} actionLabel="Discover members" actionTo="/connections/discover"/>}
    {active === "network" && !loading && networkInfo.totalPages > 1 && <nav className="flex items-center justify-center gap-3"><button className="btn-muted" disabled={page === 0} onClick={() => setPage((n) => n - 1)}>Previous</button><span className="text-sm text-brand-muted">Page {page + 1} of {networkInfo.totalPages} · {networkInfo.totalElements} connections</span><button className="btn-muted" disabled={page + 1 >= networkInfo.totalPages} onClick={() => setPage((n) => n + 1)}>Next</button></nav>}
  </div>;
}
function other(connection, currentUserId) { return connection.sender?.id === currentUserId ? connection.receiver : connection.sender; }

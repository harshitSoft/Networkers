import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, Users } from "lucide-react";
import toast from "react-hot-toast";
import { connectionApi } from "../../api/connectionApi";
import { chapterApi } from "../../api/chapterApi";
import { groupApi } from "../../api/groupApi";
import EmptyState from "../../components/EmptyState.jsx";

const blank = { q: "", city: "", state: "", country: "", profession: "", category: "", chapterId: "", groupId: "", sort: "relevant" };
export default function MemberDirectory() {
  const [filters, setFilters] = useState(blank);
  const [query, setQuery] = useState(blank);
  const [chapters, setChapters] = useState([]);
  const [groups, setGroups] = useState([]);
  const [result, setResult] = useState({ content: [], page: 0, totalPages: 0, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});

  useEffect(() => { chapterApi.all().then(setChapters).catch(() => setChapters([])); groupApi.discover({ page: 0, size: 50 }).then((data) => setGroups(data?.content || [])).catch(() => setGroups([])); }, []);
  useEffect(() => {
    const timer = setTimeout(() => { setQuery(filters); setPage(0); }, 300);
    return () => clearTimeout(timer);
  }, [filters]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    connectionApi.discover({ ...query, page, size: 20 }).then((data) => active && setResult(data || { content: [], totalElements: 0, totalPages: 0 }))
      .catch(() => active && toast.error("Could not load the member directory"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [query, page]);

  async function connect(member) {
    const message = window.prompt(`Add a short note for ${member.fullName} (optional):`, "");
    if (message === null) return;
    setBusy((state) => ({ ...state, [member.id]: true }));
    try {
      await connectionApi.send(member.id, message);
      toast.success("Connection request sent");
      setResult((data) => ({ ...data, content: data.content.map((item) => item.id === member.id ? { ...item, connectionStatus: "PENDING_SENT" } : item) }));
    } catch (error) { toast.error(error.response?.data?.message || "Could not send request"); }
    finally { setBusy((state) => ({ ...state, [member.id]: false })); }
  }

  const set = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  return <div className="page-shell space-y-5">
    <header><p className="page-kicker">Global connections</p><h1 className="page-title">Discover <span className="text-brand-accent">Members</span></h1><p className="mt-2 text-sm text-brand-muted">Find professionals across Networkers chapters and build your worldwide network.</p></header>
    <section className="card p-5">
      <label className="relative block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={18}/><input className="field !pl-10" placeholder="Search name, company, profession, services, or chapter" value={filters.q} onChange={(e) => set("q", e.target.value)}/></label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input className="field" placeholder="City" value={filters.city} onChange={(e) => set("city", e.target.value)}/>
        <input className="field" placeholder="State" value={filters.state} onChange={(e) => set("state", e.target.value)}/>
        <input className="field" placeholder="Country" value={filters.country} onChange={(e) => set("country", e.target.value)}/>
        <input className="field" placeholder="Profession" value={filters.profession} onChange={(e) => set("profession", e.target.value)}/>
        <input className="field" placeholder="Business category" value={filters.category} onChange={(e) => set("category", e.target.value)}/>
        <select className="field" value={filters.chapterId} onChange={(e) => set("chapterId", e.target.value)}><option value="">All chapters</option>{chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.chapterName}</option>)}</select>
        <select className="field" value={filters.groupId} onChange={(e) => set("groupId", e.target.value)}><option value="">All groups</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select>
        <select className="field" value={filters.sort} onChange={(e) => set("sort", e.target.value)}><option value="relevant">Relevant matches</option><option value="recent">Recently joined</option><option value="alphabetical">Alphabetical</option></select>
        <button className="btn-muted" onClick={() => setFilters(blank)}>Clear filters</button>
      </div>
    </section>
    <div className="flex items-center justify-between text-sm text-brand-muted"><span><Users className="mr-2 inline" size={17}/>{result.totalElements || 0} members</span><Link className="font-bold text-red-600 hover:underline" to="/connections">My connections</Link></div>
    {loading ? <div className="grid gap-4 md:grid-cols-2"><div className="card h-48 animate-pulse"/><div className="card h-48 animate-pulse"/></div> : result.content?.length ? <div className="grid gap-4 md:grid-cols-2">
      {result.content.map((member) => <article key={member.id} className="card p-5">
        <div className="flex gap-4"><Avatar member={member}/><div className="min-w-0 flex-1"><h2 className="truncate text-lg font-black">{member.fullName}</h2><p className="text-sm font-semibold text-red-600">{member.profession || member.category || "Networkers Member"}</p><p className="mt-1 truncate text-sm text-brand-muted">{member.businessName || "Business profile"}</p></div></div>
        <div className="mt-4 space-y-1 text-sm text-brand-muted"><p className="flex gap-2"><MapPin size={16}/>{[member.city, member.state, member.country].filter(Boolean).join(", ") || "Location not listed"}</p><p>{member.chapterName || "Networkers member"}{member.category ? ` · ${member.category}` : ""}</p><p className="line-clamp-2">{member.services || ""}</p></div>
        <div className="mt-4 flex flex-wrap gap-2"><Link className="btn-muted" to={`/connections/members/${member.id}`}>View profile</Link><StatusAction member={member} busy={busy[member.id]} onConnect={() => connect(member)}/></div>
      </article>)}
    </div> : <><EmptyState title="No members found" message="Try a different search or clear some filters."/><div className="text-center"><button className="btn-muted" onClick={() => setFilters(blank)}>Clear filters</button></div></>}
    {!loading && result.totalPages > 1 && <nav className="flex items-center justify-center gap-3"><button className="btn-muted" disabled={!page} onClick={() => setPage((n) => n - 1)}>Previous</button><span className="text-sm font-bold text-brand-muted">Page {page + 1} of {result.totalPages}</span><button className="btn-muted" disabled={page + 1 >= result.totalPages} onClick={() => setPage((n) => n + 1)}>Next</button></nav>}
  </div>;
}

export function Avatar({ member }) { const image = member.logoUrl || member.profileImage; return <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-red-500/10 font-black text-red-600">{image ? <img className="h-full w-full object-cover" src={image} alt=""/> : member.fullName?.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div>; }
export function StatusAction({ member, busy, onConnect }) {
  if (member.connectionStatus === "CONNECTED") return <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">Connected</span>;
  if (member.connectionStatus === "PENDING_SENT") return <span className="rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">Request sent</span>;
  if (member.connectionStatus === "PENDING_RECEIVED") return <Link className="btn-primary" to="/connections?tab=received">Review request</Link>;
  return <button className="btn-primary" disabled={busy} onClick={onConnect}>{busy ? "Sending…" : "Connect"}</button>;
}

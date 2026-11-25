import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { connectionApi } from "../../api/connectionApi";
import StatCard from "../../components/StatCard.jsx";
import { Handshake, Inbox, Search, XCircle } from "lucide-react";

export default function ManageConnections() {
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [filter, setFilter] = useState({ q: "", status: "" });
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => { connectionApi.adminOverview().then(setStats).catch(() => toast.error("Could not load connection metrics")); }, []);
  useEffect(() => { const timer = setTimeout(() => { setLoading(true); connectionApi.adminRecords({ ...filter, page: pageNumber, size: 20 }).then(setPage).catch(() => toast.error("Could not load connection records")).finally(() => setLoading(false)); }, 250); return () => clearTimeout(timer); }, [filter, pageNumber]);
  return <div className="page-shell space-y-5"><header><p className="page-kicker">Admin · Member relationships</p><h1 className="page-title">Connections <span className="text-brand-accent">Management</span></h1><p className="mt-2 text-sm text-brand-muted">Review global connection activity and investigate member relationships.</p></header>
    {stats && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Active connections" value={stats.activeConnections} icon={Handshake}/><StatCard label="Pending requests" value={stats.pendingRequests} icon={Inbox}/><StatCard label="Rejected requests" value={stats.rejectedRequests} icon={XCircle}/><StatCard label="Withdrawn requests" value={stats.withdrawnRequests} icon={XCircle}/></div>}
    <section className="card p-5"><div className="grid gap-3 md:grid-cols-[1fr_220px]"><label className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={17}/><input className="field !pl-10" placeholder="Search member, chapter, or country" value={filter.q} onChange={(e) => { setPageNumber(0); setFilter((f) => ({ ...f, q: e.target.value })); }}/></label><select className="field" value={filter.status} onChange={(e) => { setPageNumber(0); setFilter((f) => ({ ...f, status: e.target.value })); }}><option value="">All statuses</option>{["PENDING","ACCEPTED","REJECTED","WITHDRAWN","REMOVED"].map((s) => <option key={s}>{s}</option>)}</select></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="text-xs uppercase text-brand-muted"><tr><th className="py-3">Members</th><th>Chapters</th><th>Request message</th><th>Status</th><th>Date</th></tr></thead><tbody>{page.content?.map((c) => <tr key={c.id} className="border-t border-brand-border/20"><td className="py-3 font-semibold">{c.sender.fullName} <span className="text-brand-muted">↔</span> {c.receiver.fullName}</td><td>{[c.sender.chapterName,c.receiver.chapterName].filter(Boolean).join(" · ") || "—"}</td><td className="max-w-56 truncate">{c.message || "—"}</td><td><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold">{c.status}</span></td><td>{new Date(c.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table>{!loading && !page.content?.length && <p className="py-8 text-center text-sm text-brand-muted">No connection records found.</p>}{loading && <p className="py-8 text-center text-sm text-brand-muted">Loading connection records…</p>}</div>
      {page.totalPages > 1 && <nav className="mt-4 flex items-center justify-center gap-3"><button className="btn-muted" disabled={pageNumber === 0} onClick={() => setPageNumber((n) => n - 1)}>Previous</button><span className="text-sm text-brand-muted">Page {pageNumber + 1} of {page.totalPages}</span><button className="btn-muted" disabled={pageNumber + 1 >= page.totalPages} onClick={() => setPageNumber((n) => n + 1)}>Next</button></nav>}
      <p className="mt-3 text-xs text-brand-muted">Administrative view only. Member requests are accepted or rejected by their recipients.</p>
    </section>
  </div>;
}

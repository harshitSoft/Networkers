import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Clock3, Send, ShieldCheck, XCircle } from "lucide-react";
import { referralApi } from "../../api/referralApi";
import EmptyState from "../../components/EmptyState.jsx";
import { ReferralPanel } from "./ReferralsReceived.jsx";
import Loader from "../../components/Loader.jsx";

const filters = [
  { id: "ALL", label: "All", icon: Send, matches: () => true },
  { id: "PENDING", label: "Pending", icon: Clock3, matches: (status) => ["NEW", "IN_DISCUSSION", "CONFIRMED"].includes(status) },
  { id: "ACCEPTED", label: "Accepted", icon: ShieldCheck, matches: (status) => status === "ACCEPTED" },
  { id: "COMPLETED", label: "Completed", icon: CheckCircle2, matches: (status) => ["COMPLETED", "CONVERTED"].includes(status) },
  { id: "DECLINED", label: "Declined / Cancelled", icon: XCircle, matches: (status) => ["DECLINED", "LOST", "CANCELLED", "CANCELED"].includes(status) },
];

const statusStyles = {
  NEW: "border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ACCEPTED: "border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  IN_DISCUSSION: "border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  CONFIRMED: "border-indigo-400/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  COMPLETED: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  CONVERTED: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  DECLINED: "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  LOST: "border-slate-400/30 bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

const readableStatus = (status = "NEW") => status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function ReferralsGiven() {
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const data = await referralApi.givenPage(page, 20);
      setItems(data?.content || []);
      setPageInfo({ totalPages: data?.totalPages || 0, totalElements: data?.totalElements || 0 });
    } catch (error) {
      setItems([]);
      toast.error(error.response?.data?.message || "Unable to load given referrals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const counts = useMemo(() => Object.fromEntries(filters.map((filter) => [filter.id, items.filter((item) => filter.matches(item.status)).length])), [items]);
  const selected = filters.find((filter) => filter.id === activeFilter) || filters[0];
  const filteredItems = useMemo(() => items.filter((item) => selected.matches(item.status)), [items, selected]);

  return (
    <div className="page-shell">
      <header className="relative overflow-hidden rounded-3xl border border-brand-border/40 bg-gradient-to-br from-brand-panel via-brand-panel to-red-950/20 p-6 shadow-premium sm:p-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-red-600/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="page-kicker">Referral activity</p>
            <h1 className="mt-2 page-title">Referrals <span className="text-brand-accent">Given</span></h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">Track every referral you have shared and quickly review its current progress.</p>
          </div>
          <div className="rounded-2xl border border-brand-border/40 bg-brand-base/60 px-5 py-3 text-right backdrop-blur">
            <p className="text-3xl font-black text-brand-primary">{pageInfo.totalElements}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">Total given</p>
          </div>
        </div>
      </header>

      {!loading && <section className="glass-card rounded-3xl p-3 sm:p-4" aria-label="Filter referrals given by status">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(({ id, label, icon: Icon }) => {
            const active = activeFilter === id;
            return <button key={id} type="button" aria-pressed={active} onClick={() => setActiveFilter(id)} className={`flex min-w-max items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition ${active ? "border-red-500 bg-gradient-to-r from-red-700 to-red-500 text-white shadow-lg shadow-red-900/20" : "border-brand-border/40 bg-brand-panel/60 text-brand-muted hover:border-red-500/40 hover:text-brand-primary"}`}><Icon size={17} /><span>{label}</span><span className={`grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-xs ${active ? "bg-white/20 text-white" : "bg-brand-base text-brand-primary"}`}>{counts[id]}</span></button>;
          })}
        </div>
      </section>}

      {!loading && <div className="flex items-center justify-between gap-3 px-1">
        <div><h2 className="text-lg font-black text-brand-primary">{selected.label} referrals</h2><p className="text-sm text-brand-muted">Showing {filteredItems.length} of {items.length}</p></div>
      </div>}

      {loading ? <Loader label="Loading given referrals" /> : <section className="grid gap-5 xl:grid-cols-2">
        {filteredItems.map((referral) => <ReferralPanel key={referral.id} referral={referral} counterpartLabel="Given to" counterpart={referral.receivedBy} actions={<div className="mt-5 flex items-center justify-between gap-3 border-t border-brand-border/30 pt-4"><span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Current status</span><span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-black ${statusStyles[referral.status] || statusStyles.NEW}`}>{readableStatus(referral.status)}</span></div>} />)}
      </section>}

      {!loading && filteredItems.length === 0 && <EmptyState title={activeFilter === "ALL" ? "No referrals given" : `No ${selected.label.toLowerCase()} referrals`} message={activeFilter === "ALL" ? "Use Give Referral to send client work to the correct member." : "There are no referrals in this status right now. Choose another filter to continue browsing."} actionLabel={activeFilter === "ALL" ? "Give Referral" : undefined} actionTo={activeFilter === "ALL" ? "/give-referral" : undefined} />}
      {!loading && pageInfo.totalPages > 1 && <div className="flex flex-wrap items-center justify-center gap-3"><button className="btn-muted" disabled={page===0} onClick={()=>setPage(page-1)}>Previous</button><span className="text-sm text-brand-muted">Page {page+1} of {pageInfo.totalPages} · {pageInfo.totalElements} referrals</span><button className="btn-primary" disabled={page+1>=pageInfo.totalPages} onClick={()=>setPage(page+1)}>Next</button></div>}
    </div>
  );
}

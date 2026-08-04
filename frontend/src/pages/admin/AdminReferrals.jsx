import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { chapterApi } from "../../api/chapterApi";
import EmptyState from "../../components/EmptyState.jsx";
import { Pagination } from "./ManageUsers.jsx";
import {X} from "lucide-react";

export default function AdminReferrals() {
  const [items, setItems] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [filters, setFilters] = useState({ status: "", chapter: "", search: "", month: "" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    adminApi.referrals().then((data) => setItems(Array.isArray(data) ? data : [])).catch(() => setItems([]));
    chapterApi.all().then(setChapters).catch(() => setChapters([]));
  }, []);
  const filtered = useMemo(() => items.filter((r) => {
    const searchText = `${r.givenBy?.fullName || ""} ${r.receivedBy?.fullName || ""} ${r.givenBy?.businessName || ""} ${r.receivedBy?.businessName || ""}`.toLowerCase();
    const chapterMatch = !filters.chapter || String(r.givenBy?.chapter?.id || "") === filters.chapter || String(r.receivedBy?.chapter?.id || "") === filters.chapter;
    const monthMatch = !filters.month || String(r.createdAt || "").startsWith(filters.month);
    return (!filters.status || r.status === filters.status) && chapterMatch && (!filters.search || searchText.includes(filters.search.toLowerCase())) && monthMatch;
  }), [items, filters]);
  useEffect(() => { setPage(1); }, [filters]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const visible = filtered.slice((page - 1) * 10, page * 10);
  return (
    <div className="space-y-5">
      <div><h2 className="text-2xl font-black">Admin Referrals</h2><p className="mt-1 text-sm text-slate-500">View and manage referral records across chapters.</p></div>
      <div className="card grid gap-3 p-4 md:grid-cols-4">
        <select className="field" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          {["NEW", "ACCEPTED", "IN_DISCUSSION", "CONFIRMED", "CONVERTED", "COMPLETED", "DECLINED"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="field" value={filters.chapter} onChange={(e) => setFilters({ ...filters, chapter: e.target.value })}>
          <option value="">All chapters</option>
          {chapters.map((c) => <option key={c.id} value={c.id}>{c.chapterName}</option>)}
        </select>
        <input className="field" placeholder="Giver/receiver search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <input className="field" type="month" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })} />
      </div>
      <div className="card overflow-x-auto">
        {filtered.length > 0 ? (
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-red-50 text-xs uppercase text-red-800"><tr>{["ID", "Giver", "Receiver", "Work", "Client", "Estimated", "Status", "Confirmed", "Created"].map((h) => <th className="p-3" key={h}>{h}</th>)}</tr></thead>
            <tbody>{visible.map((r) => <tr className="cursor-pointer border-t align-top transition hover:bg-red-500/5" key={r.id} onClick={()=>setSelected(r)} title="View complete referral details">
              <td className="p-3 font-bold">#{r.id}</td><td className="p-3">{r.givenBy?.fullName || "-"}</td><td className="p-3">{r.receivedBy?.fullName || "-"}</td><td className="p-3">{r.workTitle || r.workName || "-"}</td><td className="p-3">{r.clientName}</td><td className="p-3">Rs {Number(r.estimatedPrice || r.estimatedBudget || 0).toLocaleString("en-IN")}</td><td className="p-3">{r.status}</td><td className="p-3">Rs {Number(r.confirmedAmount || 0).toLocaleString("en-IN")}</td><td className="p-3">{String(r.createdAt || "").slice(0, 10)}</td>
            </tr>)}</tbody>
          </table>
        ) : <div className="p-5"><EmptyState title="No referrals found" message="Referral records will appear here." /></div>}
      </div>
      {filtered.length > 10 && <Pagination page={page} pageCount={pageCount} onPage={setPage} />}
      {selected&&<ReferralDetails referral={selected} onClose={()=>setSelected(null)}/>}
    </div>
  );
}

const money=value=>`Rs ${Number(value||0).toLocaleString("en-IN")}`;
function ReferralDetails({referral:r,onClose}){const giver=r.givenBy||{},receiver=r.receivedBy||{};return <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="referral-title" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="card mx-auto my-8 w-full max-w-5xl overflow-hidden"><header className="flex items-start justify-between border-b border-white/10 bg-gradient-to-r from-red-950/80 to-transparent p-6"><div><p className="page-kicker">Referral #{r.id}</p><h2 id="referral-title" className="mt-1 text-2xl font-black">{r.workTitle||r.workName||r.productOrServiceRequired||"Referral details"}</h2><span className="status-pill mt-3 inline-flex">{String(r.status||"UNKNOWN").replaceAll("_"," ")}</span></div><button className="glass-icon" onClick={onClose} aria-label="Close referral details"><X/></button></header><div className="grid gap-6 p-6 lg:grid-cols-2"><DetailSection title="Client & work" rows={[["Client name",r.clientName],["Client company",r.clientCompany],["Client number",r.clientPhone],["Client email",r.clientEmail],["Work title",r.workTitle||r.workName],["Category",r.workCategory],["Product / service",r.productOrServiceRequired],["Location",r.location],["Requirement",r.requirement],["Description",r.description]]}/><DetailSection title="Deal information" rows={[["Estimated budget",money(r.estimatedBudget||r.estimatedPrice)],["Completed deal amount",money(r.confirmedAmount||r.businessValue)],["Priority",r.priority],["Referral type",r.referralType],["Status",r.status],["Created",formatDate(r.createdAt)],["Last updated",formatDate(r.updatedAt)],["Notes",r.notes]]}/><MemberSection title="Sender details" member={giver}/><MemberSection title="Receiver details" member={receiver}/></div></div></div>}
function DetailSection({title,rows}){return <section className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><h3 className="mb-4 font-black text-red-400">{title}</h3><dl className="space-y-3">{rows.map(([label,value])=><div className="grid gap-1 border-b border-white/5 pb-2 sm:grid-cols-[145px_1fr]" key={label}><dt className="text-xs uppercase tracking-wider text-brand-muted">{label}</dt><dd className="break-words text-sm font-semibold">{value||"—"}</dd></div>)}</dl></section>}
function MemberSection({title,member}){return <DetailSection title={title} rows={[["Full name",member.fullName],["Business",member.businessName],["Email",member.email],["Mobile",member.mobile],["Category",member.businessCategory],["Services",member.services],["Location",member.location],["Chapter",member.chapter?.chapterName]]}/>}
function formatDate(value){if(!value)return"—";return new Intl.DateTimeFormat("en-IN",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value))}

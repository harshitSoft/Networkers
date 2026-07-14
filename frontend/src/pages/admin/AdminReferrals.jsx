import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { chapterApi } from "../../api/chapterApi";
import EmptyState from "../../components/EmptyState.jsx";

export default function AdminReferrals() {
  const [items, setItems] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [filters, setFilters] = useState({ status: "", chapter: "", search: "", month: "" });
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
  return (
    <div className="space-y-5">
      <div><h2 className="text-2xl font-black">Admin Referrals</h2><p className="mt-1 text-sm text-slate-500">View and manage referral records across chapters.</p></div>
      <div className="card grid gap-3 p-4 md:grid-cols-4">
        <select className="field" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          {["NEW", "ACCEPTED", "IN_DISCUSSION", "CONFIRMED", "COMPLETED", "DECLINED"].map((s) => <option key={s} value={s}>{s}</option>)}
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
            <tbody>{filtered.map((r) => <tr className="border-t align-top" key={r.id}>
              <td className="p-3 font-bold">#{r.id}</td><td className="p-3">{r.givenBy?.fullName || "-"}</td><td className="p-3">{r.receivedBy?.fullName || "-"}</td><td className="p-3">{r.workTitle || r.workName || "-"}</td><td className="p-3">{r.clientName}</td><td className="p-3">Rs {Number(r.estimatedPrice || r.estimatedBudget || 0).toLocaleString("en-IN")}</td><td className="p-3">{r.status}</td><td className="p-3">Rs {Number(r.confirmedAmount || 0).toLocaleString("en-IN")}</td><td className="p-3">{String(r.createdAt || "").slice(0, 10)}</td>
            </tr>)}</tbody>
          </table>
        ) : <div className="p-5"><EmptyState title="No referrals found" message="Referral records will appear here." /></div>}
      </div>
    </div>
  );
}

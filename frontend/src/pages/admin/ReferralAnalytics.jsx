import { useEffect, useMemo, useState } from "react";
import { BarChart3, Handshake, TrendingUp, Users } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import StatCard from "../../components/StatCard.jsx";

export default function ReferralAnalytics() {
  const [items, setItems] = useState([]);
  useEffect(() => { adminApi.referrals().then((data) => setItems(Array.isArray(data) ? data : [])).catch(() => setItems([])); }, []);
  const stats = useMemo(() => {
    const confirmed = items.filter((r) => ["CONFIRMED", "COMPLETED"].includes(r.status));
    const total = confirmed.reduce((sum, r) => sum + Number(r.confirmedAmount || r.businessValue || 0), 0);
    const month = new Date().toISOString().slice(0, 7);
    const currentMonth = confirmed.filter((r) => String(r.updatedAt || r.createdAt || "").startsWith(month)).reduce((sum, r) => sum + Number(r.confirmedAmount || r.businessValue || 0), 0);
    return { confirmed, total, currentMonth, topGivers: rank(confirmed, "givenBy"), topEarners: rank(confirmed, "receivedBy"), chapterRevenue: chapterRank(confirmed) };
  }, [items]);
  return (
    <div className="page-shell">
      <div className="rounded-2xl bg-white p-6 shadow-premium"><p className="page-kicker">Revenue intelligence</p><h2 className="mt-2 page-title">Revenue <span className="text-[#E8262A]">Analytics</span></h2><p className="mt-1 text-sm text-slate-500">Business revenue analytics from confirmed and completed referrals.</p></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Business Revenue Given" value={`Rs ${stats.total.toLocaleString("en-IN")}`} icon={TrendingUp} />
        <StatCard label="Total Business Revenue Earned" value={`Rs ${stats.total.toLocaleString("en-IN")}`} icon={BarChart3} />
        <StatCard label="Current Month Revenue" value={`Rs ${stats.currentMonth.toLocaleString("en-IN")}`} icon={BarChart3} />
        <StatCard label="Total Confirmed Referrals" value={stats.confirmed.length} icon={Handshake} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <RankTable title="Top Givers" rows={stats.topGivers} />
        <RankTable title="Top Earners" rows={stats.topEarners} />
        <RankTable title="Chapter-wise Revenue" rows={stats.chapterRevenue} />
      </div>
    </div>
  );
}

function rank(referrals, key) {
  const map = new Map();
  referrals.forEach((r) => {
    const user = r[key];
    const name = user?.businessName || user?.fullName || "Unknown";
    map.set(name, (map.get(name) || 0) + Number(r.confirmedAmount || r.businessValue || 0));
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
}

function chapterRank(referrals) {
  const map = new Map();
  referrals.forEach((r) => {
    const name = r.receivedBy?.chapter?.chapterName || r.givenBy?.chapter?.chapterName || "Unassigned";
    map.set(name, (map.get(name) || 0) + Number(r.confirmedAmount || r.businessValue || 0));
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function RankTable({ title, rows }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2"><Users className="text-red-700" size={18} /><h3 className="font-black">{title}</h3></div>
      <div className="mt-4 space-y-3">
        {rows.map(([name, amount]) => <div className="flex justify-between gap-3 rounded-2xl bg-red-50 px-3 py-2 text-sm" key={name}><span className="font-bold">{name}</span><span className="font-black text-red-700">Rs {Number(amount).toLocaleString("en-IN")}</span></div>)}
        {rows.length === 0 && <p className="text-sm text-slate-500">No confirmed revenue yet.</p>}
      </div>
    </div>
  );
}

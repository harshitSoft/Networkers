import { useEffect, useState } from "react";
import { Briefcase, CalendarDays, Handshake, Users } from "lucide-react";
import StatCard from "../../components/StatCard.jsx";
import { adminApi } from "../../api/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  useEffect(() => { adminApi.dashboard().then(setStats).catch(() => setStats({})); }, []);
  return <div className="page-shell"><div className="rounded-2xl bg-[#4D4D4D] p-6 text-white shadow-premium"><p className="page-kicker text-red-100">Admin workspace</p><h2 className="mt-2 text-3xl font-black">Admin <span className="text-red-200">Dashboard</span></h2><p className="mt-2 text-white/75">Monitor members, businesses, referrals, and meetups from one professional control center.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Users" value={stats.totalUsers} icon={Users}/><StatCard label="Businesses" value={stats.totalBusinesses} icon={Briefcase}/><StatCard label="Referrals" value={stats.totalReferrals} icon={Handshake}/><StatCard label="Meetups" value={stats.totalMeetups} icon={CalendarDays}/></div><div className="card p-5"><p className="text-sm font-semibold text-slate-500">Total business generated</p><p className="mt-2 text-3xl font-black text-red-700">Rs {stats.totalBusinessGenerated || 0}</p></div></div>;
}

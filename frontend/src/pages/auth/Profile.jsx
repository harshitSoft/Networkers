import { useEffect, useState } from "react";
import { BadgeCheck, Briefcase, Mail, MapPin, Phone, TrendingUp, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { referralApi } from "../../api/referralApi";
import StatCard from "../../components/StatCard.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";

export default function Profile() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  useEffect(() => { referralApi.dashboard().then(setSummary).catch(() => setSummary(null)); }, []);
  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-[#4D4D4D] p-6 text-white shadow-premium">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-white/20"><UserCircle size={38} /></div>
          <div>
            <h2 className="text-3xl font-black">{user.fullName}</h2>
            <p className="mt-1 text-red-50">{user.role} | {user.enabled ? "Active account" : "Inactive account"}</p>
          </div>
        </div>
      </section>
      <div className="grid gap-5 lg:grid-cols-3">
        <InfoCard title="Contact Information" icon={Mail} rows={[
          ["Email", user.email, Mail], ["Mobile", user.mobile || "-", Phone], ["Location", user.location || "-", MapPin], ["Account Status", user.enabled ? "Active" : "Inactive", BadgeCheck]
        ]} />
        <InfoCard title="Business Information" icon={Briefcase} rows={[
          ["Business Name", user.businessName || "-"], ["Business Category", user.businessCategory || "-"], ["Services", user.services || "-"]
        ]} />
        <InfoCard title="Chapter & Subscription" icon={BadgeCheck} rows={[
          ["Chapter", user.chapterName || "-"], ["Subscription Plan", user.subscriptionPlan || "-"], ["Start Date", user.subscriptionStartDate || "-"], ["End Date", user.subscriptionEndDate || "-"]
        ]} />
      </div>
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Referrals Given" value={summary.referralsGiven || 0} icon={TrendingUp} />
          <StatCard label="Referrals Received" value={summary.referralsReceived || 0} icon={TrendingUp} />
          <StatCard label="Revenue Given" value={`Rs ${Number(summary.totalBusinessGiven || 0).toLocaleString("en-IN")}`} icon={TrendingUp} />
          <StatCard label="Revenue Earned" value={`Rs ${Number(summary.totalBusinessEarned || 0).toLocaleString("en-IN")}`} icon={TrendingUp} />
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, icon: Icon, rows }) {
  return (
    <GlowCard as="section">
      <div className="flex items-center gap-2"><Icon className="text-red-700" size={20} /><h3 className="font-black">{title}</h3></div>
      <div className="mt-4 space-y-3">
        {rows.map(([label, value, RowIcon]) => (
          <div className="rounded-2xl bg-slate-50 p-3" key={label}>
            <p className="text-xs font-black uppercase text-slate-500">{label}</p>
            <p className="mt-1 flex items-center gap-2 break-words text-sm font-semibold text-slate-800">{RowIcon && <RowIcon size={15} className="text-red-700" />} {value}</p>
          </div>
        ))}
      </div>
    </GlowCard>
  );
}

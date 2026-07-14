import { useEffect, useState } from "react";
import { BadgeCheck, BarChart3, Handshake, Network, Send, TrendingUp } from "lucide-react";
import StatCard from "../../components/StatCard.jsx";
import Loader from "../../components/Loader.jsx";
import { referralApi } from "../../api/referralApi";

const money = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

export default function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    referralApi.dashboard().then(setData).catch(() => setData({}));
  }, []);
  if (!data) return <Loader />;
  return (
    <div className="page-shell">
      <div className="rounded-2xl bg-[#4D4D4D] p-6 text-white shadow-premium">
        <p className="text-sm font-black uppercase tracking-wide text-red-100">Member dashboard</p>
        <h2 className="mt-2 text-3xl font-black">Referral and <span className="text-red-200">revenue</span> analytics</h2>
        <p className="mt-2 max-w-2xl text-red-50">Track your chapter subscription, referrals shared, referrals received, and confirmed business value.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Referrals Given" value={data.referralsGiven || 0} icon={Send} />
        <StatCard label="Referrals Received" value={data.referralsReceived || 0} icon={Handshake} />
        <StatCard label="Business Revenue Earned" value={money(data.businessRevenueEarned)} icon={TrendingUp} />
        <StatCard label="Business Revenue Given" value={money(data.businessRevenueGiven)} icon={BarChart3} />
        <StatCard label="Current Chapter" value={data.currentChapter || "Not assigned"} icon={Network} />
        <StatCard label="Active Subscription" value={data.activeSubscription || "Not assigned"} icon={BadgeCheck} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="This Month Given" value={money(data.thisMonthBusinessGiven)} icon={BarChart3} />
        <StatCard label="This Month Earned" value={money(data.thisMonthBusinessEarned)} icon={TrendingUp} />
        <StatCard label="Total Given" value={money(data.totalBusinessGiven)} icon={BarChart3} />
        <StatCard label="Total Earned" value={money(data.totalBusinessEarned)} icon={TrendingUp} />
      </div>
    </div>
  );
}

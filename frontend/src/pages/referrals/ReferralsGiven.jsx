import { useEffect, useState } from "react";
import { referralApi } from "../../api/referralApi";
import EmptyState from "../../components/EmptyState.jsx";
import { ReferralPanel } from "./ReferralsReceived.jsx";

export default function ReferralsGiven() {
  const [items, setItems] = useState([]);
  useEffect(() => { referralApi.given().then((data) => setItems(Array.isArray(data) ? data : [])).catch(() => setItems([])); }, []);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-premium"><p className="page-kicker">Referral history</p><h2 className="mt-1 page-title">Referrals <span className="text-[#E8262A]">Given</span></h2></div>
      {items.map((r) => <ReferralPanel key={r.id} referral={{ ...r, givenBy: r.receivedBy }} actions={<span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-black text-slate-700">Latest: {r.status}</span>} />)}
      {items.length === 0 && <EmptyState title="No referrals given" message="Use Give Referral to send client work to the correct member." actionLabel="Give Referral" actionTo="/give-referral" />}
    </div>
  );
}

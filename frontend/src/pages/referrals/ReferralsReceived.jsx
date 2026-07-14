import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Circle } from "lucide-react";
import { referralApi } from "../../api/referralApi";
import EmptyState from "../../components/EmptyState.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";

const flow = ["NEW", "ACCEPTED", "IN_DISCUSSION", "CONFIRMED", "COMPLETED"];
const labels = { NEW: "New", ACCEPTED: "Accepted", IN_DISCUSSION: "In Discussion", CONFIRMED: "Confirmed", COMPLETED: "Completed" };

export default function ReferralsReceived() {
  const [items, setItems] = useState([]);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [completeForm, setCompleteForm] = useState({ confirmedAmount: "", note: "" });
  const load = () => referralApi.received().then((data) => setItems(Array.isArray(data) ? data : [])).catch(() => setItems([]));
  useEffect(() => { load(); }, []);
  async function update(referral, status) {
    if (status === "COMPLETED") {
      setCompleteTarget(referral);
      setCompleteForm({ confirmedAmount: referral.confirmedAmount || referral.estimatedPrice || referral.estimatedBudget || "", note: "" });
      return;
    }
    await referralApi.status(referral.id, status);
    toast.success("Referral updated");
    load();
  }
  async function complete(e) {
    e.preventDefault();
    await referralApi.status(completeTarget.id, "COMPLETED", Number(completeForm.confirmedAmount || 0));
    toast.success("Referral completed");
    setCompleteTarget(null);
    load();
  }
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-premium"><p className="page-kicker">Referral inbox</p><h2 className="mt-1 page-title">Referrals <span className="text-[#E8262A]">Received</span></h2></div>
      {items.map((r) => <ReferralPanel key={r.id} referral={r} actions={<StatusFlow referral={r} onStep={update} />} />)}
      {items.length === 0 && <EmptyState title="No referrals received" message="Referral requests assigned to you will appear here." />}
      {completeTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <form onSubmit={complete} className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <h3 className="text-2xl font-black">Complete Referral</h3>
            <p className="mt-2 text-sm text-slate-500">{completeTarget.workTitle || completeTarget.clientName}</p>
            <div className="mt-5 space-y-3">
              <input className="field" required type="number" min="1" placeholder="Final deal amount / confirmed amount" value={completeForm.confirmedAmount} onChange={(e) => setCompleteForm({ ...completeForm, confirmedAmount: e.target.value })} />
              <textarea className="field" rows="3" placeholder="Optional note" value={completeForm.note} onChange={(e) => setCompleteForm({ ...completeForm, note: e.target.value })} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-muted" onClick={() => setCompleteTarget(null)}>Cancel</button>
              <button className="btn-primary">Complete Referral</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function StatusFlow({ referral, onStep }) {
  const currentIndex = flow.indexOf(referral.status);
  const declined = referral.status === "DECLINED";
  const canDecline = referral.status === "NEW";
  return (
    <div className="mt-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        {flow.map((step, index) => {
          const complete = !declined && index < currentIndex;
          const current = !declined && index === currentIndex;
          const clickable = !declined && index === currentIndex + 1;
          const isFirstAccept = referral.status === "NEW" && step === "ACCEPTED";
          return (
            <button key={step} disabled={!clickable && !isFirstAccept} onClick={() => onStep(referral, step)} className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black transition ${current ? "border-red-700 bg-red-700 text-white" : complete ? "border-red-200 bg-red-50 text-red-700" : clickable || isFirstAccept ? "border-red-300 bg-white text-red-700 hover:bg-red-50" : "border-slate-200 bg-slate-50 text-slate-400"}`}>
              {complete ? <CheckCircle2 size={15} /> : <Circle size={15} />} {labels[step]}
            </button>
          );
        })}
      </div>
      {canDecline && <button className="btn-muted mt-3 text-red-700 hover:bg-red-50" onClick={() => onStep(referral, "DECLINED")}>Decline</button>}
      {declined && <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">Declined</span>}
    </div>
  );
}

export function ReferralPanel({ referral, actions }) {
  return (
    <GlowCard as="article">
      <div>
        <p className="text-sm font-black uppercase text-red-700">{referral.status}</p>
        <h3 className="mt-1 text-xl font-black">{referral.workTitle || referral.workName || referral.clientName}</h3>
        <p className="mt-1 text-sm text-slate-600">Client: {referral.clientName} | {referral.clientPhone} {referral.clientEmail ? `| ${referral.clientEmail}` : ""}</p>
        <p className="mt-1 text-sm text-slate-600">Given by: {referral.givenBy?.fullName} | {referral.givenBy?.businessName} | {referral.givenBy?.chapter?.chapterName}</p>
        <p className="mt-3 leading-7 text-slate-600">{referral.description || referral.requirement}</p>
        <p className="mt-2 text-sm font-semibold text-slate-700">{referral.workCategory || referral.productOrServiceRequired} | {referral.location}</p>
        <p className="mt-2 text-sm font-semibold text-slate-700">Estimated: Rs {Number(referral.estimatedPrice || referral.estimatedBudget || 0).toLocaleString("en-IN")} {referral.confirmedAmount ? `| Confirmed: Rs ${Number(referral.confirmedAmount).toLocaleString("en-IN")}` : ""}</p>
      </div>
      {actions}
    </GlowCard>
  );
}

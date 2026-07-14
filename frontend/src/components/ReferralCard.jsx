import { CalendarDays, IndianRupee, MapPin, UserRound } from "lucide-react";
import GlowCard from "./ui/GlowCard.jsx";

const flow = ["NEW", "CONTACTED", "MEETING_SCHEDULED", "IN_DISCUSSION", "CONVERTED", "LOST"];

export default function ReferralCard({ referral, mode = "received", onStatus, onValue }) {
  const current = referral.status || "NEW";
  const nextStatuses = nextAllowed(current);
  const title = referral.workName || referral.clientName || "Client lead";
  const description = referral.requirement || referral.description || "No description added.";
  const counterparty = mode === "received" ? referral.givenBy : referral.receivedBy;

  async function updateStatus(status) {
    if (status === "CONVERTED" && !referral.businessValue) {
      const amount = window.prompt("Enter converted business value");
      if (!amount) return;
      await onStatus?.(referral.id, status);
      await onValue?.(referral.id, Number(amount));
      return;
    }
    await onStatus?.(referral.id, status);
  }

  return (
    <GlowCard as="article" className="overflow-hidden">
      {referral.posterUrl && <img src={referral.posterUrl} alt="" className="h-44 w-full object-cover" />}
      <div className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
          <p className="text-xs font-black uppercase text-red-700">{referral.referralType || "DIRECT"} Referral</p>
            <h3 className="mt-1 text-xl font-black text-slate-950">{title}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-600">{referral.productOrServiceRequired || referral.clientCompany || "Service requirement"}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-black ${current === "CONVERTED" ? "bg-red-50 text-red-700" : current === "LOST" ? "bg-slate-100 text-slate-600" : "bg-red-50 text-red-700"}`}>{current}</span>
        </div>

        <p className="mt-4 leading-7 text-slate-600">{description}</p>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Meta icon={<UserRound size={16} />} label={mode === "received" ? "Shared by" : "Sent to / responded by"} value={counterparty?.fullName || "Network member"} />
          <Meta icon={<CalendarDays size={16} />} label="Date" value={referral.createdAt ? new Date(referral.createdAt).toLocaleDateString() : "Recent"} />
          <Meta icon={<MapPin size={16} />} label="Location" value={referral.location || "Not specified"} />
          <Meta icon={<IndianRupee size={16} />} label="Budget / Value" value={referral.businessValue ? `Rs ${Number(referral.businessValue).toLocaleString("en-IN")}` : referral.estimatedBudget ? `Rs ${Number(referral.estimatedBudget).toLocaleString("en-IN")}` : "Not specified"} />
        </div>

        {mode === "received" && onStatus && (
          <div className="mt-6">
            <p className="text-sm font-black text-slate-700">Status progress</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {flow.slice(1).map((status) => {
                const active = nextStatuses.includes(status);
                const done = isCompleted(current, status);
                return (
                  <button
                    key={status}
                    disabled={!active}
                    onClick={() => updateStatus(status)}
                    className={`rounded-full px-3 py-2 text-xs font-black transition ${active ? "bg-[#E8262A] text-white hover:bg-[#B91C1C]" : done ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-400"}`}
                  >
                    {status.replaceAll("_", " ")}
                  </button>
                );
              })}
            </div>
            {current === "CONVERTED" && !referral.businessValue && (
              <button className="btn-primary mt-4" onClick={async () => {
                const amount = window.prompt("Enter converted business value");
                if (amount) await onValue?.(referral.id, Number(amount));
              }}>Add Deal Amount</button>
            )}
          </div>
        )}
      </div>
    </GlowCard>
  );
}

function Meta({ icon, label, value }) {
  return <div className="rounded-2xl bg-slate-50 p-3"><p className="flex items-center gap-1 text-xs font-bold uppercase text-slate-400">{icon}{label}</p><p className="mt-1 font-bold text-slate-700">{value}</p></div>;
}

function nextAllowed(status) {
  if (status === "NEW") return ["CONTACTED"];
  if (status === "CONTACTED") return ["MEETING_SCHEDULED"];
  if (status === "MEETING_SCHEDULED") return ["IN_DISCUSSION"];
  if (status === "IN_DISCUSSION") return ["CONVERTED", "LOST"];
  return [];
}

function isCompleted(current, status) {
  if (current === "LOST") return status === "LOST";
  if (current === "CONVERTED") return status !== "LOST";
  return flow.indexOf(status) <= flow.indexOf(current);
}

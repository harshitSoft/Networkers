import { Building2, MapPin, ShieldCheck } from "lucide-react";
import GlowCard from "./ui/GlowCard.jsx";

export default function BusinessCard({ business, action }) {
  return (
    <GlowCard>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1A1A1A] text-white">
          <Building2 size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-bold text-slate-950">{business.businessName || "Business profile"}</h3>
            {business.verified && <ShieldCheck className="h-4 w-4 text-red-600" />}
          </div>
          <p className="text-sm text-slate-600">{business.category || "Business services"}</p>
          <p className="mt-2 line-clamp-2 text-sm text-slate-500">{business.services || business.description}</p>
          <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-500"><MapPin size={14} /> {business.city || "Remote"}</p>
        </div>
      </div>
      {action && <div className="mt-4">{action}</div>}
    </GlowCard>
  );
}

import GlowCard from "./ui/GlowCard.jsx";

export default function StatCard({ label, value, icon: Icon }) {
  return (
    <GlowCard>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 break-words text-3xl font-black text-[#1A1A1A]">{value ?? 0}</p>
        </div>
        {Icon && <Icon className="h-11 w-11 shrink-0 rounded-2xl bg-red-50 p-2.5 text-red-700" />}
      </div>
    </GlowCard>
  );
}

import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState({ title = "Nothing here yet", message = "When data is available, it will appear here.", actionLabel, actionTo }) {
  return (
    <div className="glass-card rounded-3xl border border-dashed border-red-500/25 p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-500 shadow-[0_0_22px_rgba(225,6,0,.12)]">
        <PlusCircle size={24} />
      </div>
      <h3 className="mt-4 text-lg font-black text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#888]">{message}</p>
      {actionLabel && actionTo && (
        <Link className="btn-primary mt-5" to={actionTo}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState({ title = "Nothing here yet", message = "When data is available, it will appear here.", actionLabel, actionTo }) {
  return (
    <div className="rounded-2xl border border-dashed border-red-200 bg-white p-8 text-center shadow-premium">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <PlusCircle size={24} />
      </div>
      <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{message}</p>
      {actionLabel && actionTo && (
        <Link className="btn-primary mt-5" to={actionTo}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

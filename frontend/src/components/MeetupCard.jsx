import { CalendarDays, MapPin } from "lucide-react";
import GlowCard from "./ui/GlowCard.jsx";

export default function MeetupCard({ meetup, action }) {
  return (
    <GlowCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">{meetup.title || "Business meetup"}</h3>
          <p className="mt-2 text-sm text-slate-500">{meetup.description}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium text-slate-600">
            <span className="flex items-center gap-1"><CalendarDays size={16} /> {meetup.date} {meetup.startTime}</span>
            <span className="flex items-center gap-1"><MapPin size={16} /> {meetup.city}</span>
          </div>
        </div>
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">{meetup.status}</span>
      </div>
      {action && <div className="mt-5">{action}</div>}
    </GlowCard>
  );
}

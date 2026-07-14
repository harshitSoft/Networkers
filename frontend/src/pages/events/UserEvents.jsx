import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { eventApi } from "../../api/eventApi";
import { useAuth } from "../../context/AuthContext.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";

export default function UserEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  useEffect(() => { eventApi.all().then(setEvents).catch(() => setEvents([])); }, []);
  const visible = events.filter((event) => !event.chapter || event.chapter?.id === user?.chapterId || event.chapter?.chapterName === user?.chapterName);
  const upcoming = visible.filter((event) => event.eventType === "UPCOMING");
  const completed = visible.filter((event) => event.eventType === "COMPLETED");
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-premium"><p className="page-kicker">Member events</p><h2 className="mt-1 page-title">Chapter <span className="text-[#E8262A]">Events</span></h2><p className="mt-1 text-sm text-slate-500">Upcoming chapter and all-community events, plus completed event galleries.</p></div>
      <EventSection title="Upcoming Events" events={upcoming} />
      <EventSection title="Completed Event Gallery" events={completed} gallery />
    </div>
  );
}

function EventSection({ title, events, gallery = false }) {
  return (
    <section className="space-y-3">
      <h3 className="section-title">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <GlowCard as="article" key={event.id}>
            <div className="flex items-start gap-3"><CalendarDays className="text-red-700" size={22} /><div><h4 className="text-lg font-black">{event.title}</h4><p className="text-sm font-semibold text-red-700">{event.eventDate} {event.eventTime ? `at ${event.eventTime}` : ""}</p></div></div>
            <p className="mt-3 text-sm text-slate-600">{event.location}</p>
            <p className="mt-1 text-sm text-slate-500">{event.chapter?.chapterName || "All community"} | {event.eventType}</p>
            <p className="mt-3 leading-7 text-slate-600">{event.description}</p>
            {gallery && event.images?.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3">{event.images.map((image) => <img className="h-36 w-full rounded-2xl object-cover" src={image.imageUrl} alt={event.title} key={image.id} />)}</div>}
          </GlowCard>
        ))}
        {events.length === 0 && <p className="text-sm text-slate-500">No events found.</p>}
      </div>
    </section>
  );
}

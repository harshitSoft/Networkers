import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import toast from "react-hot-toast";
import { eventApi } from "../../api/eventApi";
import { useAuth } from "../../context/AuthContext.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";

export default function UserEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState({});

  useEffect(() => {
    eventApi.upcoming().then(setEvents).catch(() => setEvents([]));
    eventApi.myRsvps().then(setRsvps).catch(() => setRsvps({}));
  }, []);

  async function respond(id, status) {
    try {
      await eventApi.rsvp(id, status);
      setRsvps((current) => ({ ...current, [id]: status }));
      toast.success(status === "GOING" ? "You are marked as attending" : "You are marked as not attending");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save response");
    }
  }

  const visible = events.filter((event) => !event.chapter || event.chapter.id === user?.chapterId || event.chapter.chapterName === user?.chapterName);

  return <div className="space-y-8">
    <div className="rounded-2xl bg-white p-5 shadow-premium">

      <h2 className="mt-1 page-title">Chapter <span className="text-[#E8262A]">Events</span></h2>
      <p className="mt-1 text-sm text-slate-500">View event details and manage attendance separately.</p>
    </div>
    <EventSection events={visible} />
    <AttendanceSection events={visible} rsvps={rsvps} onRespond={respond} />
  </div>;
}

function EventSection({ events }) {
  return <section className="space-y-3">
    <h3 className="section-title !text-brand-primary">Events</h3>
    <div className="grid gap-4 md:grid-cols-2">{events.map((event) => <GlowCard as="article" key={event.id}>
      {event.images?.[0]?.imageUrl && <img className="-mx-6 -mt-6 mb-5 aspect-video w-[calc(100%+3rem)] object-cover" src={event.images[0].imageUrl} alt={event.title} />}
      <div className="flex items-start gap-3"><CalendarDays className="text-red-700" size={22} /><div><h4 className="text-lg font-black">{event.title}</h4><p className="text-sm font-semibold text-red-700">{event.eventDate}{event.eventTime ? ` at ${event.eventTime}` : ""}</p></div></div>
      {event.location && <p className="mt-3 text-sm text-slate-600">{event.location}</p>}
      <p className="mt-1 text-sm text-slate-500">{event.chapter?.chapterName || "All community"}</p>
      {event.description && <p className="mt-3 leading-7 text-slate-600">{event.description}</p>}
    </GlowCard>)}{events.length === 0 && <p className="text-sm text-slate-500">No upcoming events.</p>}</div>
  </section>;
}

function AttendanceSection({ events, rsvps, onRespond }) {
  return <section className="space-y-3">
    <div><h3 className="section-title !text-brand-primary">Event Attendance</h3><p className="mt-1 text-sm text-slate-500">Confirm whether you will attend each event.</p></div>
    <div className="space-y-3">{events.map((event) => <div className="card flex flex-wrap items-center justify-between gap-4 p-4" key={event.id}>
      <div><p className="font-black">{event.title}</p><p className="text-sm text-slate-500">{event.eventDate}{event.eventTime ? ` at ${event.eventTime}` : ""}</p></div>
      <div className="flex flex-wrap gap-2"><button onClick={() => onRespond(event.id, "GOING")} className={rsvps[event.id] === "GOING" ? "btn-primary" : "btn-muted"}>Attending</button><button onClick={() => onRespond(event.id, "NOT_GOING")} className={rsvps[event.id] === "NOT_GOING" ? "btn-primary" : "btn-muted"}>Not attending</button></div>
    </div>)}{events.length === 0 && <p className="text-sm text-slate-500">No upcoming events.</p>}</div>
  </section>;
}

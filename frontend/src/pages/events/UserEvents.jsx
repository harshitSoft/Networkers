import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { eventApi } from "../../api/eventApi";
import { useAuth } from "../../context/AuthContext.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";
import toast from "react-hot-toast";

export default function UserEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const[rsvps,setRsvps]=useState({});
  useEffect(() => { eventApi.upcoming().then(setEvents).catch(() => setEvents([]));eventApi.myRsvps().then(setRsvps).catch(()=>setRsvps({})); }, []);
  async function respond(id,status){try{await eventApi.rsvp(id,status);setRsvps(v=>({...v,[id]:status}));toast.success(status==="GOING"?"You are marked as going":"Response saved") }catch(e){toast.error(e.response?.data?.message||"Could not save response")}}
  const visible = events.filter((event) => !event.chapter || event.chapter?.id === user?.chapterId || event.chapter?.chapterName === user?.chapterName);
  const upcoming = visible.filter((event) => event.eventType === "UPCOMING");
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-premium"><p className="page-kicker">Member events</p><h2 className="mt-1 page-title">Chapter <span className="text-[#E8262A]">Events</span></h2><p className="mt-1 text-sm text-slate-500">Upcoming chapter and all-community events.</p></div>
      <EventSection title="Upcoming Events" events={upcoming} rsvps={rsvps} onRespond={respond} />
    </div>
  );
}

function EventSection({ title, events, gallery = false, rsvps={}, onRespond }) {
  return (
    <section className="space-y-3">
      <h3 className="section-title !text-brand-primary">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <GlowCard as="article" key={event.id}>
            {event.images?.[0]?.imageUrl && <img className="-mx-6 -mt-6 mb-5 aspect-video w-[calc(100%+3rem)] object-cover" src={event.images[0].imageUrl} alt={event.title} />}
            <div className="flex items-start gap-3"><CalendarDays className="text-red-700" size={22} /><div><h4 className="text-lg font-black">{event.title}</h4><p className="text-sm font-semibold text-red-700">{event.eventDate} {event.eventTime ? `at ${event.eventTime}` : ""}</p></div></div>
            <p className="mt-3 text-sm text-slate-600">{event.location}</p>
            <p className="mt-1 text-sm text-slate-500">{event.chapter?.chapterName || "All community"} | {event.eventType}</p>
            <p className="mt-3 leading-7 text-slate-600">{event.description}</p>
            {!gallery&&<div className="mt-5 flex flex-wrap items-center gap-2 border-t border-red-500/15 pt-4"><span className="mr-1 text-sm font-bold">Will you attend?</span><button onClick={()=>onRespond(event.id,"GOING")} className={rsvps[event.id]==="GOING"?"btn-primary":"btn-muted"}>Yes, I’m coming</button><button onClick={()=>onRespond(event.id,"NOT_GOING")} className={rsvps[event.id]==="NOT_GOING"?"btn-primary":"btn-muted"}>Not attending</button></div>}
            {gallery && event.images?.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3">{event.images.map((image) => <img className="h-36 w-full rounded-2xl object-cover" src={image.imageUrl} alt={event.title} key={image.id} />)}</div>}
          </GlowCard>
        ))}
        {events.length === 0 && <p className="text-sm text-slate-500">No events found.</p>}
      </div>
    </section>
  );
}

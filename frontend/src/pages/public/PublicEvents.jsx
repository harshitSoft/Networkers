import { useEffect, useState } from "react";
import { eventApi } from "../../api/eventApi";
import PublicNavbar from "./PublicNavbar.jsx";
import LandingFooter from "../../components/landing/LandingFooter.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";

export default function PublicEvents() {
  const [events, setEvents] = useState([]);
  useEffect(() => { eventApi.all().then(setEvents).catch(() => setEvents([])); }, []);
  const upcoming = events.filter((event) => event.eventType === "UPCOMING");
  const completed = events.filter((event) => event.eventType === "COMPLETED");
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <PublicNavbar />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p className="page-kicker">Events</p>
        <h1 className="mt-2 text-4xl font-black">Meet. Learn. <span className="text-[#E8262A]">Refer.</span></h1>
        <h2 className="mt-8 section-title">Upcoming Events</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {upcoming.map((event) => <EventCard event={event} key={event.id} />)}
        </div>
        <h2 className="mt-10 section-title">Completed Event Gallery</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {completed.map((event) => <EventCard event={event} gallery key={event.id} />)}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

function EventCard({ event, gallery = false }) {
  return (
    <GlowCard as="article">
      <h3 className="text-xl font-black">{event.title}</h3>
      <p className="mt-2 text-sm font-semibold text-red-700">{event.eventDate} {event.eventTime ? `at ${event.eventTime}` : ""}</p>
      <p className="mt-1 text-slate-600">{event.location}</p>
      <p className="mt-3 leading-7 text-slate-600">{event.description}</p>
      {gallery && event.images?.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3">{event.images.map((image) => <img className="h-36 w-full rounded-2xl object-cover" src={image.imageUrl} alt={event.title} key={image.id} />)}</div>}
    </GlowCard>
  );
}

import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { eventApi } from "../../api/eventApi";
import PublicNavbar from "./PublicNavbar.jsx";
import LandingFooter from "../../components/landing/LandingFooter.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";
import ScrollReveal from "../../components/ui/ScrollReveal.jsx";
const fallback =
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80";
export default function PublicEvents() {
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState("upcoming");
  useEffect(() => {
    eventApi
      .all()
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);
  const shown = events.filter((e) =>
    tab === "upcoming"
      ? e.eventType === "UPCOMING"
      : e.eventType === "COMPLETED",
  );
  return (
    <div className="public-page">
      <PublicNavbar />
      <main className="content-shell section-pad">
        <p className="eyebrow">The calendar</p>
        <h1 className="page-title mt-3">
          Meet. Learn. <span className="text-gradient">Refer.</span>
        </h1>
        <div className="event-tabs mt-9 inline-flex rounded-full border border-red-500/20 bg-[#111] p-1.5">
          {[
            ["upcoming", "Upcoming Events"],
            ["gallery", "Event Gallery"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${tab === key ? "active bg-red-600 text-white shadow-[0_0_22px_rgba(225,6,0,.4)]" : "text-[#888] hover:text-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {shown.length === 0 ? (
          <div className="glass-card mt-10 rounded-3xl p-14 text-center">
            <CalendarDays className="mx-auto text-red-500" size={42} />
            <h2 className="mt-5 text-2xl font-bold">
              No {tab === "upcoming" ? "upcoming events" : "gallery moments"}
            </h2>
            <p className="mt-2 text-[#888]">
              Check back soon—the next room is being curated.
            </p>
          </div>
        ) : (
          <div
            className={`mt-10 grid gap-5 ${tab === "gallery" ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"}`}
          >
            {shown.map((event, i) => (
              <ScrollReveal delay={i * 60} key={event.id}>
                <EventCard event={event} gallery={tab === "gallery"} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </main>
      <LandingFooter />
    </div>
  );
}
function EventCard({ event, gallery }) {
  const image = event.images?.[0]?.imageUrl || fallback;
  return (
    <GlowCard className="h-full">
      <div className="image-frame -mx-6 -mt-6 mb-6 aspect-video rounded-t-3xl border-0">
        <img
          loading="lazy"
          src={image}
          alt={event.title}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-4 top-4 z-10 rounded-xl bg-red-600 px-3 py-2 font-data text-xs font-bold">
          {event.eventDate || "SOON"}
        </span>
      </div>
      <span className="status-pill">{gallery ? "Completed" : "Upcoming"}</span>
      <h2 className="mt-4 text-2xl font-bold">{event.title}</h2>
      <div className="mt-4 grid gap-2 text-sm text-[#b3b3b3]">
        <p className="flex items-center gap-2">
          <CalendarDays size={16} className="text-red-500" />
          {event.eventDate} {event.eventTime && `· ${event.eventTime}`}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={16} className="text-red-500" />
          {event.location}
        </p>
      </div>
      <p className="mt-4 line-clamp-2 leading-7 text-[#888]">
        {event.description}
      </p>
      {!gallery && (
        <div className="mt-6 flex items-center justify-between gap-3">
          <button className="glow-button glow-button-primary !px-4 !py-2">
            View Details
          </button>
          <span className="flex items-center gap-1 text-xs text-red-400">
            <Users size={14} /> Limited spots
          </span>
        </div>
      )}
    </GlowCard>
  );
}

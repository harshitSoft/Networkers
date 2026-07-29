import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Handshake,
  Network,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import PublicNavbar from "./PublicNavbar.jsx";
import LandingFooter from "../../components/landing/LandingFooter.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";
import ScrollReveal from "../../components/ui/ScrollReveal.jsx";
import { chapterApi } from "../../api/chapterApi.js";
import { eventApi } from "../../api/eventApi.js";
import { realGalleryItems } from "../../data/galleryItems.js";

const heroSlides = [
  {
    src: "/gallery/mainheronetworkers.webp",
    alt: "Networkers community members at a professional gathering",
  },
  {
    src: "/gallery/networkers11.jpeg",
    alt: "Networkers members gathered for a community event",
  },
  {
    src: "/gallery/networkers66.webp",
    alt: "Networkers chapter members together",
  },
];

export default function LandingPage() {
  const [chapters, setChapters] = useState([]);
  const [events, setEvents] = useState([]);
  const [heroSlide, setHeroSlide] = useState(0);
  useEffect(() => {
    chapterApi
      .all()
      .then(setChapters)
      .catch(() => setChapters([]));
    eventApi
      .upcoming()
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);
  useEffect(() => {
    const timer = window.setInterval(
      () => setHeroSlide((current) => (current + 1) % heroSlides.length),
      2000,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="public-page">
      <PublicNavbar />
      <main>
        <section className="content-shell hero-grid">
          <ScrollReveal>
            <span className="status-pill">Trusted professional community</span>
            <h1 className="hero-title mt-7">
              Connect.
              <br />
              Refer.
              <br />
              <span className="hero-underline text-gradient">
                Grow Together.
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-[#b3b3b3]">
              Join an admin-managed chapter, build trusted relationships, and
              turn your professional network into measurable growth.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/join" className="glow-button glow-button-primary">
                Join now <ArrowRight size={18} />
              </Link>
              <Link
                to="/chapters"
                className="glow-button glow-button-secondary"
              >
                Explore chapters
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <div className="hero-main-image image-frame group relative h-[400px] rounded-[2rem] sm:h-[500px] lg:h-[600px]">
              {heroSlides.map((slide, index) => (
                <img
                  key={slide.src}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                    index === heroSlide ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                  src={slide.src}
                  alt={index === heroSlide ? slide.alt : ""}
                  aria-hidden={index !== heroSlide}
                />
              ))}
            </div>
          </ScrollReveal>
        </section>
        <section className="section-solid section-pad">
          <div className="content-shell">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="eyebrow">Admin-created chapters</p>
                <h2 className="mt-3 text-4xl font-bold">
                  Choose the chapter you want to join.
                </h2>
              </div>
              <Link to="/chapters" className="glow-button glow-button-secondary">
                View all chapters <ArrowRight size={17} />
              </Link>
            </div>
            {chapters.length === 0 ? (
              <div className="glass-card mt-10 rounded-3xl p-10 text-center text-[#888]">
                No chapters are available yet. The admin must create one before
                users can join.
              </div>
            ) : (
              <div className="mt-10 grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
                {chapters.slice(0, 3).map((chapter, i) => (
                  <ScrollReveal className="h-full" delay={i * 60} key={chapter.id}>
                    <GlowCard className="h-full">
                      <div className="flex h-full flex-col">
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="font-data text-xs text-red-400">
                            CHAPTER {chapter.chapterNumber}
                          </p>
                          <h3 className="mt-2 font-serif text-3xl font-black leading-tight tracking-tight">
                            {chapter.chapterName}
                          </h3>
                        </div>
                        <span className="status-pill self-start">Active</span>
                      </div>
                      {chapter.description && <p className="mt-4 line-clamp-2 text-[#888]">{chapter.description}</p>}
                      <div className="mt-5 flex justify-between text-sm">
                        <span className="flex gap-2">
                          <Users size={17} className="text-red-500" />
                          {chapter.memberCount} members
                        </span>
                      </div>
                      <Link
                        to={`/join?chapter=${chapter.id}`}
                        className="glow-button glow-button-primary mt-auto !mt-6 w-full"
                      >
                        Join this chapter
                      </Link>
                      </div>
                    </GlowCard>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>
        <section className="content-shell section-pad">
          <p className="eyebrow">Upcoming events</p>
          <h2 className="mt-3 text-4xl font-bold">
            Events that bring the right people together.
          </h2>
          {events.length === 0 ? (
            <div className="glass-card mt-10 rounded-3xl p-10 text-center text-[#888]">
              No upcoming events have been published.
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {events.slice(0, 6).map((event, i) => (
                <ScrollReveal delay={i * 60} key={event.id}>
                  <GlowCard>
                    <div className="image-frame -mx-6 -mt-6 mb-6 aspect-video rounded-t-3xl border-0">
                      <img
                        className="h-full w-full object-cover"
                        src={
                          event.images?.[0]?.imageUrl ||
                          "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80"
                        }
                        alt={event.title}
                      />
                    </div>
                    <span className="status-pill">Upcoming</span>
                    <h3 className="mt-4 text-2xl font-bold">{event.title}</h3>
                    <div className="mt-4 grid gap-2 text-sm text-[#b3b3b3]">
                      <p className="flex gap-2">
                        <CalendarDays size={17} className="text-red-500" />
                        {event.eventDate}{" "}
                        {event.eventTime && `at ${event.eventTime}`}
                      </p>
                      <p className="flex gap-2">
                        <Network size={17} className="text-red-500" />
                        {event.location || "Venue to be announced"}
                      </p>
                      <p className="flex gap-2">
                        <Handshake size={17} className="text-red-500" />
                        {event.chapter?.chapterName || "All chapters"}
                      </p>
                    </div>
                    <p className="mt-4 line-clamp-2 text-[#888]">
                      {event.description}
                    </p>
                  </GlowCard>
                </ScrollReveal>
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <Link to="/events" className="glow-button glow-button-secondary">
              View all events <ArrowRight size={17} />
            </Link>
          </div>
        </section>
        <section className="section-solid section-pad">
          <div className="content-shell">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {realGalleryItems.slice(0, 6).map((item, index) => (
                <ScrollReveal delay={index * 55} key={item.id}>
                  <Link
                    to="/gallery"
                    className="image-frame group block aspect-[4/3] overflow-hidden rounded-3xl bg-brand-panel"
                    aria-label={`View gallery: ${item.title}`}
                  >
                    <img
                      loading="lazy"
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 to-transparent p-5 pt-14 text-white">
                      <span className="text-xs font-black uppercase tracking-wider text-red-300">{item.category}</span>
                    </span>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/gallery" className="glow-button glow-button-secondary">
                View full gallery <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

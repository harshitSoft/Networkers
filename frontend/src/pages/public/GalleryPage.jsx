import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PublicNavbar from "./PublicNavbar.jsx";
import LandingFooter from "../../components/landing/LandingFooter.jsx";
import GalleryTabs from "../../components/gallery/GalleryTabs.jsx";
import GalleryGrid from "../../components/gallery/GalleryGrid.jsx";
import LightboxModal from "../../components/gallery/LightboxModal.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";
import { eventApi } from "../../api/eventApi";
import { realGalleryItems } from "../../data/galleryItems.js";

const tabs = [
  "All",
  "Chapter Meetings",
  "Workshops",
  "Networking Events",
  "Celebrations",
];

const stockFallbackItems = [
  [
    "chapter-meet",
    "Chapter Meetings",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    "North Chapter Power Breakfast",
    "June 2026",
  ],
  [
    "workshop-1",
    "Workshops",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    "Referral Strategy Workshop",
    "May 2026",
  ],
  [
    "networking-1",
    "Networking Events",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
    "Founders Networking Evening",
    "April 2026",
  ],
  [
    "celebration-1",
    "Celebrations",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
    "Business Milestone Celebration",
    "March 2026",
  ],
  [
    "chapter-2",
    "Chapter Meetings",
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
    "Member Spotlight Roundtable",
    "February 2026",
  ],
  [
    "workshop-2",
    "Workshops",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
    "Growth Systems Clinic",
    "January 2026",
  ],
  [
    "networking-2",
    "Networking Events",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    "City Business Mixer",
    "December 2025",
  ],
  [
    "celebration-2",
    "Celebrations",
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80",
    "Annual Recognition Night",
    "November 2025",
  ],
  [
    "chapter-3",
    "Chapter Meetings",
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=80",
    "Trusted Leads Forum",
    "October 2025",
  ],
].map(([id, category, image, title, date]) => ({
  id,
  category,
  image,
  title,
  date,
}));
const fallbackItems = realGalleryItems.length ? realGalleryItems : stockFallbackItems;

export default function GalleryPage() {
  const [active, setActive] = useState("All");
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedId, setSelectedId] = useState(null);
  const [apiItems, setApiItems] = useState([]);

  useEffect(() => {
    eventApi
      .all()
      .then((events) => {
        const items = Array.isArray(events)
          ? events.flatMap((event) => normalizeEvent(event))
          : [];
        setApiItems(items);
      })
      .catch(() => setApiItems([]));
  }, []);

  const allItems = [...fallbackItems, ...apiItems];
  const filtered = useMemo(
    () =>
      active === "All"
        ? allItems
        : allItems.filter((item) => item.category === active),
    [active, allItems],
  );
  const visible = filtered.slice(0, visibleCount);
  const selectedIndex = filtered.findIndex((item) => item.id === selectedId);
  const selected = selectedIndex >= 0 ? filtered[selectedIndex] : null;

  const close = useCallback(() => setSelectedId(null), []);
  const previous = useCallback(
    () =>
      setSelectedId(
        filtered[(selectedIndex - 1 + filtered.length) % filtered.length]?.id,
      ),
    [filtered, selectedIndex],
  );
  const next = useCallback(
    () => setSelectedId(filtered[(selectedIndex + 1) % filtered.length]?.id),
    [filtered, selectedIndex],
  );

  return (
    <div className="public-page">
      <PublicNavbar />
      <main className="space-y-10 pb-14 pt-8">
        <GalleryTabs
          tabs={tabs}
          active={active}
          onChange={(tab) => {
            setActive(tab);
            setVisibleCount(6);
            setSelectedId(null);
          }}
        />
        <GalleryGrid
          items={visible}
          onOpen={(item) => setSelectedId(item.id)}
        />

        {visibleCount < filtered.length && (
          <div className="text-center">
            <button
              type="button"
              className="btn-primary"
              onClick={() => setVisibleCount((count) => count + 3)}
            >
              Load More
            </button>
          </div>
        )}

        <section className="section-solid px-4 py-12">
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["60+", "Active Members"],
              ["3+", "Local Chapters"],
              ["1+", "Cities"],
              ["2cr+", "Business Done"],
            ].map(([value, label]) => (
              <GlowCard key={label} hover={false}>
                <p className="font-data text-4xl font-black text-[#FF1E1E]">
                  {value}
                </p>
                <p className="mt-1 text-sm font-bold uppercase tracking-wide text-[#888]">
                  {label}
                </p>
              </GlowCard>
            ))}
          </div>
        </section>

        <section className="px-4">
          <div className="glass-card mx-auto flex max-w-6xl flex-col gap-5 rounded-3xl bg-gradient-to-r from-[#8B0000]/70 to-[#0A0A0A] p-8 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-black">
                Start Growing Your Network Today
              </h2>
              <p className="mt-2 max-w-2xl text-white/75">
                Meet trusted members, exchange high-quality referrals, and turn
                conversations into measurable business growth.
              </p>
            </div>
            <Link to="/join" className="glow-button glow-button-primary">
              Join Now <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
      <LandingFooter />
      <LightboxModal
        item={selected}
        onClose={close}
        onPrevious={previous}
        onNext={next}
      />
    </div>
  );
}

function normalizeEvent(event) {
  const category =
    event.category || event.galleryCategory || categoryFromEvent(event);
  const date = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "Networkers event";
  return (event.images || [])
    .map((image, index) => ({
      id: `${event.id}-${image.id || index}`,
      category,
      image: image.imageUrl || image.url,
      title: event.title || "Networkers event",
      date,
    }))
    .filter((item) => item.image);
}

function categoryFromEvent(event) {
  const text = `${event.title || ""} ${event.description || ""}`.toLowerCase();
  if (text.includes("workshop")) return "Workshops";
  if (text.includes("celebration") || text.includes("award"))
    return "Celebrations";
  if (text.includes("network")) return "Networking Events";
  return "Chapter Meetings";
}

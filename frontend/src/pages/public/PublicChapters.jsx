import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { chapterApi } from "../../api/chapterApi";
import PublicNavbar from "./PublicNavbar.jsx";
import LandingFooter from "../../components/landing/LandingFooter.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";
import ScrollReveal from "../../components/ui/ScrollReveal.jsx";
const banners = [
  "photo-1521737604893-d14cc237f11d",
  "photo-1556761175-b413da4baf72",
  "photo-1552664730-d307ca884978",
];
export default function PublicChapters() {
  const [chapters, setChapters] = useState([]);
  const [query, setQuery] = useState("");
  useEffect(() => {
    chapterApi
      .all()
      .then(setChapters)
      .catch(() => setChapters([]));
  }, []);
  const visible = useMemo(
    () =>
      chapters.filter((c) =>
        c.chapterName.toLowerCase().includes(query.toLowerCase()),
      ),
    [chapters, query],
  );
  return (
    <div className="public-page">
      <PublicNavbar />
      <main className="content-shell public-page-top">
        <p className="eyebrow">The hub</p>
        <h1 className="page-title mt-3">
          Find your <span className="text-gradient">chapter.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[#b3b3b3]">
          Every chapter here is created and managed by the Networkers admin.
        </p>
        <label className="relative mt-10 block">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
            size={19}
          />
          <input
            className="field !pl-12"
            placeholder="Search chapters"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <p className="mt-5 font-data text-xs text-[#888]">
          Showing <span className="text-red-400">{visible.length}</span>{" "}
          chapters
        </p>
        {visible.length === 0 ? (
          <div className="glass-card mt-8 rounded-3xl p-12 text-center">
            <Users className="mx-auto text-red-500" />
            <h2 className="mt-4 text-xl font-bold">No chapters available</h2>
            <p className="mt-2 text-[#888]">
              An admin must create a chapter before membership requests can be
              submitted.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((chapter, i) => (
              <ScrollReveal className="h-full" delay={i * 50} key={chapter.id}>
                <GlowCard className="h-full">
                  <div className="flex h-full flex-col">
                  <div className="image-frame -mx-6 -mt-6 mb-6 aspect-video rounded-t-3xl border-0">
                    <img
                      className="h-full w-full object-cover"
                      src={`https://images.unsplash.com/${banners[i % banners.length]}?auto=format&fit=crop&w=800&q=80`}
                      alt={chapter.chapterName}
                    />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-data text-xs text-red-400">
                        CHAPTER {chapter.chapterNumber}
                      </p>
                      <h2 className="mt-1 text-2xl font-bold">
                        {chapter.chapterName}
                      </h2>
                    </div>
                    <span className="status-pill">Active</span>
                  </div>
                  <p className="mt-4 line-clamp-3 leading-7 text-[#888]">
                    {chapter.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Users size={16} className="text-red-500" />
                      {chapter.memberCount} members
                    </span>
                    <span className="font-data text-red-400">
                      Rs{" "}
                      {Number(chapter.subscriptionAmount || 0).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#888]">
                    {chapter.subscriptionName}
                  </p>
                  <Link
                    to={`/join?chapter=${chapter.id}`}
                    className="glow-button glow-button-primary mt-auto !mt-6 w-full"
                  >
                    Request to join chapter
                  </Link>
                  </div>
                </GlowCard>
              </ScrollReveal>
            ))}
          </div>
        )}
      </main>
      <LandingFooter />
    </div>
  );
}

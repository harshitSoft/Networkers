import { useEffect, useState } from "react";
import { chapterApi } from "../../api/chapterApi";
import PublicNavbar from "./PublicNavbar.jsx";
import LandingFooter from "../../components/landing/LandingFooter.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";

export default function PublicChapters() {
  const [chapters, setChapters] = useState([]);
  useEffect(() => { chapterApi.all().then(setChapters).catch(() => setChapters([])); }, []);
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <PublicNavbar />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p className="page-kicker">Local chapters</p>
        <h1 className="mt-2 text-4xl font-black">Find Your <span className="text-[#E8262A]">Network</span></h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {chapters.map((chapter) => (
            <GlowCard as="article" key={chapter.id}>
              <p className="text-sm font-black uppercase text-red-700">Chapter {chapter.chapterNumber}</p>
              <h2 className="mt-2 text-2xl font-black">{chapter.chapterName}</h2>
              <p className="mt-1 text-slate-600">{chapter.location}</p>
              <p className="mt-4 leading-7 text-slate-600">{chapter.description}</p>
              <div className="mt-5 grid gap-2 text-sm font-semibold text-slate-700">
                <span>{chapter.subscriptionName} - Rs {Number(chapter.subscriptionAmount || 0).toLocaleString("en-IN")}</span>
                <span>{chapter.memberCount} members</span>
              </div>
              <button className="btn-primary mt-5">Contact Admin to Join</button>
            </GlowCard>
          ))}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

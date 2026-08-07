import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { chapterApi } from "../../api/chapterApi";
import { useAuth } from "../../context/AuthContext.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";

export default function UserChapters() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [members, setMembers] = useState([]);
  const membersRef = useRef(null);
  useEffect(() => { chapterApi.all().then(setChapters).catch(() => setChapters([])); }, []);
  async function selectChapter(chapter) {
    setSelected(chapter);
    const data = await chapterApi.userMembers(chapter.id);
    setMembers(Array.isArray(data) ? data : []);
    requestAnimationFrame(() => membersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  function openWhatsApp(member) {
    const digits = String(member.mobile || "").replace(/\D/g, "");
    if (!digits) return;
    const phone = digits.length === 10 ? `91${digits}` : digits.replace(/^00/, "");
    const message = `Hi ${member.fullName}, I found your profile through the Networkers community and would like to connect with you.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-premium"><h2 className="mt-1 page-title"><span className="text-[#E8262A]">Chapters</span></h2><p className="mt-1 text-sm text-slate-500">Select a chapter to discover its members for referrals.</p></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {chapters.map((chapter) => {
          const isMine = String(user?.chapterId || "") === String(chapter.id) || user?.chapterName === chapter.chapterName;
          return (
            <GlowCard as="button" key={chapter.id} onClick={() => selectChapter(chapter)} className={`text-left ${isMine ? "ring-4 ring-red-100" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-black uppercase text-red-700">Chapter {chapter.chapterNumber}</p>
                {isMine && <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">Your Chapter</span>}
              </div>
              <h3 className="mt-3 font-serif text-3xl font-black leading-tight tracking-tight text-slate-950">{chapter.chapterName}</h3>
              {chapter.location && <p className="mt-1 text-sm text-slate-500">{chapter.location}</p>}
              {chapter.description && <p className="mt-3 text-sm leading-6 text-slate-600">{chapter.description}</p>}
              <div className="mt-4 space-y-1 text-sm font-semibold">
                <p>{chapter.memberCount} members</p>
              </div>
            </GlowCard>
          );
        })}
      </div>
      {selected && (
        <section ref={membersRef} className="card scroll-mt-24 p-5">
          <div className="flex items-center gap-2"><Users className="text-red-700" size={20} /><h3 className="text-xl font-black">{selected.chapterName} Members</h3></div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <GlowCard as="article" key={member.id}>
                <div className="mb-4 flex items-center gap-3"><div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-red-500/30 bg-red-500/10">{member.profileImage?<img className="h-full w-full object-cover" src={member.profileImage} alt={member.fullName}/>:<span className="grid h-full place-items-center text-lg font-black text-red-500">{member.fullName?.[0]}</span>}</div><h4 className="font-black">{member.fullName}</h4></div>
                <p className="text-sm font-semibold text-slate-700">{member.businessName}</p>
                <p className="mt-1 text-sm text-red-700">{member.businessCategory}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{member.services}</p>
                <p className="mt-2 text-sm text-slate-500">{member.location} {member.mobile ? `| ${member.mobile}` : ""}</p>
                <div className="mt-4 flex flex-wrap gap-2"><button className="btn-primary" onClick={() => navigate(`/give-referral?memberId=${member.id}`)}><Send size={16} /> Give Referral</button>{member.mobile&&<button className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1fbd5a]" onClick={() => openWhatsApp(member)} aria-label={`Chat with ${member.fullName} on WhatsApp`}><MessageCircle size={17}/> WhatsApp</button>}</div>
              </GlowCard>
            ))}
            {members.length === 0 && <p className="text-sm text-slate-500">No members assigned to this chapter yet.</p>}
          </div>
        </section>
      )}
    </div>
  );
}

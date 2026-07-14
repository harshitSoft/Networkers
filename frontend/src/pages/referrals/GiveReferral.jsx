import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search, Send } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { chapterApi } from "../../api/chapterApi";
import { memberApi } from "../../api/memberApi";
import { referralApi } from "../../api/referralApi";
import GlowCard from "../../components/ui/GlowCard.jsx";

const emptyForm = { clientName: "", clientPhone: "", clientEmail: "", workTitle: "", workCategory: "", estimatedPrice: "", description: "", location: "", notes: "" };

export default function GiveReferral() {
  const [searchParams] = useSearchParams();
  const [chapters, setChapters] = useState([]);
  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState({ chapterId: "", category: "", location: "", name: "" });
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [prefilled, setPrefilled] = useState(false);
  const params = useMemo(() => Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), [filters]);

  useEffect(() => { chapterApi.all().then(setChapters).catch(() => setChapters([])); }, []);
  useEffect(() => { memberApi.search(params).then(setMembers).catch(() => setMembers([])); }, [params]);
  useEffect(() => {
    const memberId = searchParams.get("memberId");
    if (!memberId || prefilled || members.length === 0) return;
    const member = members.find((item) => String(item.id) === String(memberId));
    if (member) {
      setSelected(member);
      setPrefilled(true);
    }
  }, [members, prefilled, searchParams]);

  async function submit(e) {
    e.preventDefault();
    await referralApi.give({ ...form, receiverId: selected.id, estimatedPrice: Number(form.estimatedPrice || 0) });
    toast.success("Referral sent");
    setSelected(null);
    setForm(emptyForm);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="page-kicker">Referral flow</p>
        <h2 className="mt-1 page-title">Give <span className="text-[#E8262A]">Referral</span></h2>
        <p className="mt-1 text-sm text-slate-500">Find the right member by chapter, work category, location, or name. Cross-chapter referrals are allowed.</p>
      </div>
      <div className="card p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <select className="field" value={filters.chapterId} onChange={(e) => setFilters({ ...filters, chapterId: e.target.value })}>
            <option value="">All chapters</option>
            {chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.chapterName}</option>)}
          </select>
          <input className="field" placeholder="Work category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
          <input className="field" placeholder="Location" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={17} />
            <input className="field pl-9" placeholder="Name or service" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <GlowCard as="article" key={member.id}>
            <p className="text-sm font-black uppercase text-red-700">{member.businessCategory}</p>
            <h3 className="mt-2 text-xl font-black">{member.businessName || member.fullName}</h3>
            <p className="mt-1 text-sm text-slate-600">Owner: {member.fullName}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{member.services}</p>
            <div className="mt-4 space-y-1 text-sm font-semibold text-slate-700">
              <p>{member.chapterName}</p>
              <p>{member.location}</p>
            </div>
            <button className="btn-primary mt-4" onClick={() => setSelected(member)}><Send size={16} /> Give Referral</button>
          </GlowCard>
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <form onSubmit={submit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl">
            <h3 className="text-2xl font-black">Referral to {selected.businessName}</h3>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                ["clientName", "Client name"], ["clientPhone", "Client phone"], ["clientEmail", "Client email optional"],
                ["workTitle", "Work title"], ["workCategory", "Work category/service required"], ["estimatedPrice", "Estimated price"],
                ["location", "Location"]
              ].map(([key, label]) => <input key={key} className="field" required={!key.includes("Email")} placeholder={label} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}
              <textarea className="field md:col-span-2" rows="4" required placeholder="Description of work" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <textarea className="field md:col-span-2" rows="3" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-muted" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn-primary">Submit Referral</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

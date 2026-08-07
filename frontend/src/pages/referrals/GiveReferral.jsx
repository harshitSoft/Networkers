import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search, Send, Users, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { chapterApi } from "../../api/chapterApi";
import { memberApi } from "../../api/memberApi";
import { referralApi } from "../../api/referralApi";
import GlowCard from "../../components/ui/GlowCard.jsx";
import { normalizePhone } from "../../utils/formValues.js";

const emptyForm = { clientName: "", clientPhone: "", clientEmail: "", workTitle: "", workCategory: "", estimatedPrice: "", description: "", location: "", notes: "" };
const draftKey = "networkers_referral_draft";

function readDraft() {
  try {
    const draft = JSON.parse(sessionStorage.getItem(draftKey) || "null");
    return draft?.form
      ? { receiverId: draft.receiverId ?? null, form: { ...emptyForm, ...draft.form } }
      : { receiverId: null, form: emptyForm };
  } catch {
    return { receiverId: null, form: emptyForm };
  }
}

function ReferralMemberSkeleton(){return <div className="glass-card animate-pulse rounded-3xl p-6" aria-hidden="true"><div className="h-16 w-16 rounded-2xl bg-red-500/10"/><div className="mt-5 h-3 w-2/5 rounded-full bg-red-500/15"/><div className="mt-3 h-6 w-4/5 rounded-full bg-brand-border/10"/><div className="mt-3 h-3 w-3/5 rounded-full bg-brand-border/10"/><div className="mt-6 space-y-2"><div className="h-3 rounded-full bg-brand-border/10"/><div className="h-3 w-5/6 rounded-full bg-brand-border/10"/></div><div className="mt-6 h-10 w-36 rounded-xl bg-red-500/15"/></div>}

export default function GiveReferral() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialDraft = useMemo(readDraft, []);
  const [chapters, setChapters] = useState([]);
  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState({ chapterId: "", category: "", location: "", name: "" });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialDraft.form);
  const [prefilled, setPrefilled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const params = useMemo(() => Object.fromEntries(Object.entries(appliedFilters).filter(([, value]) => value)), [appliedFilters]);
  const memberLoading = loading || JSON.stringify(filters)!==JSON.stringify(appliedFilters);

  useEffect(() => { chapterApi.all().then(setChapters).catch(() => setChapters([])); }, []);
  useEffect(() => { setLoading(true); const timer=window.setTimeout(()=>setAppliedFilters(filters),350); return()=>window.clearTimeout(timer); }, [filters]);
  useEffect(() => { let active=true;setLoading(true);memberApi.search(params).then((data)=>{if(active)setMembers(Array.isArray(data)?data:(data?.content||[]));}).catch((error)=>{console.error("Unable to load referral members",error);if(active){setMembers([]);toast.error(error.response?.data?.message||"Unable to load members");}}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}; }, [params]);
  useEffect(() => {
    const memberId = searchParams.get("memberId");
    if (!memberId || prefilled || members.length === 0) return;
    const member = members.find((item) => String(item.id) === String(memberId));
    if (member) {
      setSelected(member);
      setPrefilled(true);
    }
  }, [members, prefilled, searchParams]);
  useEffect(() => {
    if (selected || !initialDraft.receiverId || members.length === 0) return;
    const member = members.find((item) => String(item.id) === String(initialDraft.receiverId));
    if (member) setSelected(member);
  }, [initialDraft.receiverId, members, selected]);
  useEffect(() => {
    if (selected) {
      sessionStorage.setItem(draftKey, JSON.stringify({ receiverId: selected.id, form }));
    }
  }, [form, selected]);
  useEffect(() => {
    if (!selected) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeForm();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selected]);

  function updateField(key, value) {
    const normalizedValue = key === "clientPhone" ? normalizePhone(value) : value;
    setForm((current) => {
      const next = { ...current, [key]: normalizedValue };
      if (selected) {
        sessionStorage.setItem(
          draftKey,
          JSON.stringify({ receiverId: selected.id, form: next }),
        );
      }
      return next;
    });
  }

  function openForm(member) {
    if (selected?.id !== member.id && initialDraft.receiverId !== member.id) {
      setForm(emptyForm);
    }
    setSelected(member);
  }

  function closeForm() {
    setSelected(null);
    setForm(emptyForm);
    sessionStorage.removeItem(draftKey);
  }

  async function submit(e) {
    e.preventDefault();
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      const receiverId = Number(selected.id);
      const estimatedPrice =
        form.estimatedPrice === "" ? null : Number(form.estimatedPrice);
      const payload = {
        ...form,
        clientName: form.clientName.trim(),
        clientPhone: form.clientPhone.trim(),
        clientEmail: form.clientEmail.trim() || null,
        workTitle: form.workTitle.trim(),
        workCategory: form.workCategory.trim(),
        receiverId,
        receivedById: receiverId,
        workName: form.workTitle.trim(),
        productOrServiceRequired: form.workCategory.trim(),
        estimatedPrice,
        estimatedBudget: estimatedPrice,
        requirement: form.description.trim() || null,
      };
      if (!payload.clientPhone) {
        toast.error("Client contact number is required");
        return;
      }
      await referralApi.give(payload);
      toast.success("Referral sent successfully");
      closeForm();
      navigate("/referrals/given");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send referral. Please check the form and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>

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
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input className="field !pl-10" placeholder="Name or service" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
          </div>
        </div>
        {memberLoading&&<div className="mt-3 flex items-center gap-2 text-sm font-semibold text-brand-accent" role="status"><span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500/20 border-t-red-600"/>Finding matching members…</div>}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {memberLoading?Array.from({length:6},(_,index)=><ReferralMemberSkeleton key={index}/>):members.map((member) => (
          <GlowCard as="article" key={member.id}>
            <div className="mb-4 h-16 w-16 overflow-hidden rounded-2xl border border-brand-border/25 bg-brand-panel">{member.profileImage?<img src={member.profileImage} alt={member.fullName} className="h-full w-full object-cover"/>:<span className="grid h-full place-items-center text-xl font-black text-brand-accent">{member.fullName?.[0]||"N"}</span>}</div>
            <p className="text-sm font-black uppercase text-red-700">{member.businessCategory}</p>
            <h3 className="mt-2 text-xl font-black">{member.businessName || member.fullName}</h3>
            <p className="mt-1 text-sm text-slate-600">Owner: {member.fullName}</p>
            {member.businessDescription && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{member.businessDescription}</p>}
            <p className="mt-3 text-sm leading-6 text-slate-600"><span className="font-bold text-slate-800">Services:</span> {member.services || "Not specified"}</p>
            <div className="mt-4 space-y-1 text-sm font-semibold text-slate-700">
              <p>{member.chapterName}</p>
              <p>{member.location}</p>
            </div>
            <button className="btn-primary mt-4" onClick={() => openForm(member)}><Send size={16} /> Give Referral</button>
          </GlowCard>
        ))}
      </div>
      {!memberLoading&&members.length===0&&<div className="glass-card rounded-3xl p-10 text-center"><Users className="mx-auto text-brand-accent"/><h3 className="mt-4 text-xl font-bold">No members found</h3><p className="mt-2 text-brand-muted">Try clearing or changing the search filters.</p></div>}
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <form onSubmit={submit} className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl">
            <button type="button" aria-label="Close referral form" title="Close" onClick={closeForm} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
              <X size={22} />
            </button>
            <h3 className="pr-12 text-2xl font-black">Referral to {selected.businessName || selected.fullName}</h3>
            <p className="mt-1 text-sm text-slate-500">{selected.fullName} · {selected.businessCategory}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                ["clientName", "Client name", true], ["clientPhone", "Client contact number", true], ["clientEmail", "Client email (optional)", false],
                ["workTitle", "Work title", true], ["workCategory", "Business type", true], ["estimatedPrice", "Estimated price (optional)", false],
                ["location", "Location (optional)", false]
              ].map(([key, label, isRequired]) => <input key={key} name={key} className="field" required={isRequired} type={key === "estimatedPrice" ? "number" : key === "clientEmail" ? "email" : key === "clientPhone" ? "tel" : "text"} inputMode={key === "clientPhone" ? "tel" : key === "estimatedPrice" ? "decimal" : undefined} autoComplete={key === "clientPhone" ? "tel-national" : key === "clientEmail" ? "email" : "off"} maxLength={key === "clientPhone" ? 30 : undefined} min={key === "estimatedPrice" ? "0" : undefined} placeholder={label} value={form[key] ?? ""} onChange={({ currentTarget: { value } }) => updateField(key, value)} onBlur={({ currentTarget: { value } }) => updateField(key, value)} />)}
              <textarea name="description" className="field md:col-span-2" rows="4" placeholder="Description of work (optional)" value={form.description ?? ""} onChange={(e) => updateField("description", e.target.value)} />
              <textarea name="notes" className="field md:col-span-2" rows="3" placeholder="Notes" value={form.notes ?? ""} onChange={(e) => updateField("notes", e.target.value)} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-muted" onClick={closeForm}>Cancel</button>
              <button disabled={submitting} className="btn-primary">{submitting ? "Submitting..." : "Submit Referral"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

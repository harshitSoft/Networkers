import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, MapPin, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { connectionApi } from "../../api/connectionApi";
import { testimonialApi } from "../../api/testimonialApi";
import { Avatar } from "./MemberDirectory.jsx";

export default function MemberProfile() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [data, setData] = useState(null);
  const [request, setRequest] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [busy, setBusy] = useState(false);
  const load = () => connectionApi.member(id).then(setData).catch((error) => toast.error(error.response?.data?.message || "Could not load this member profile"));
  useEffect(() => { load(); testimonialApi.publicForMember(id).then(setTestimonials).catch(() => setTestimonials([])); if (params.get("requestId")) connectionApi.received().then((items) => setRequest(items.find((item) => String(item.id) === params.get("requestId")) || null)).catch(() => {}); }, [id]);
  if (!data) return <div className="page-shell"><div className="card h-64 animate-pulse"/></div>;
  const member = data.member;
  async function connect() { const message = window.prompt(`Add a short note for ${member.fullName} (optional):`, ""); if (message === null) return; setBusy(true); try { await connectionApi.send(member.id, message); toast.success("Connection request sent"); await load(); } catch (error) { toast.error(error.response?.data?.message || "Could not send request"); } finally { setBusy(false); } }
  async function respond(action) { setBusy(true); try { await connectionApi[action](request.id); toast.success(action === "accept" ? "Connection accepted" : "Request rejected"); setRequest(null); await load(); } catch (error) { toast.error(error.response?.data?.message || "Could not update request"); } finally { setBusy(false); } }
  return <div className="page-shell space-y-5"><Link className="inline-flex items-center gap-2 text-sm font-bold text-brand-muted hover:text-red-600" to="/connections/discover"><ArrowLeft size={17}/>Back to discovery</Link>
    <section className="card p-6"><div className="flex flex-wrap items-start gap-5"><Avatar member={member}/><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h1 className="text-2xl font-black">{member.fullName}</h1>{data.verified && <ShieldCheck className="text-red-500" size={20}/>}</div><p className="mt-1 font-semibold text-red-600">{member.profession || member.category || "Networkers Member"}</p><p className="mt-1 text-brand-muted">{member.businessName || ""}</p><p className="mt-3 flex items-center gap-2 text-sm text-brand-muted"><MapPin size={16}/>{[member.city,member.state,member.country].filter(Boolean).join(", ") || "Location not listed"}</p><p className="mt-1 text-sm text-brand-muted">{member.chapterName || "Networkers member"}</p></div>
      <div className="flex flex-wrap gap-2">{request ? <><button disabled={busy} className="btn-primary" onClick={() => respond("accept")}>Accept request</button><button disabled={busy} className="btn-muted" onClick={() => respond("reject")}>Reject</button></> : member.connectionStatus === "NONE" || member.connectionStatus === "REJECTED" || member.connectionStatus === "WITHDRAWN" ? <button disabled={busy} className="btn-primary" onClick={connect}>{busy ? "Sending…" : "Connect"}</button> : <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">{member.connectionStatus === "CONNECTED" ? "Connected" : member.connectionStatus === "PENDING_SENT" ? "Request sent" : "Request received"}</span>}</div>
    </div></section>
    <div className="grid gap-5 lg:grid-cols-2"><section className="card p-5"><h2 className="flex items-center gap-2 text-lg font-black"><BriefcaseBusiness size={18}/>Business overview</h2><p className="mt-3 text-sm leading-6 text-brand-muted">{data.description || "No business description provided."}</p><dl className="mt-4 space-y-3 text-sm"><Info label="Category" value={member.category}/><Info label="Products and services" value={data.services || member.services}/><Info label="Looking for" value={data.lookingFor}/><Info label="Website" value={data.website}/><Info label="Chapter" value={member.chapterName}/></dl></section>
      <section className="card p-5"><h2 className="text-lg font-black">Professional details</h2><dl className="mt-4 space-y-3 text-sm"><Info label="Professional title" value={member.profession}/><Info label="Business" value={member.businessName}/><Info label="Location" value={[member.city,member.state,member.country].filter(Boolean).join(", ")}/><Info label="Founded" value={data.foundedYear}/><Info label="Team size" value={data.teamSize}/></dl><p className="mt-6 text-xs text-brand-muted">Contact details remain private according to the member’s profile settings.</p></section></div>
    {testimonials.length > 0 && <section className="card p-5"><h2 className="text-lg font-black">Member testimonials</h2><div className="mt-3 grid gap-3 md:grid-cols-2">{testimonials.slice(0, 6).map((t) => <article key={t.id} className="rounded-2xl border border-brand-border/20 p-4"><p className="text-sm leading-6 text-brand-muted">“{t.description}”</p><p className="mt-3 text-xs font-bold">{t.sender?.fullName || "Networkers member"} · {t.experienceDate || ""}</p></article>)}</div></section>}
  </div>;
}
function Info({ label, value }) { return value ? <div><dt className="text-xs font-bold uppercase tracking-wide text-brand-muted">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div> : null; }

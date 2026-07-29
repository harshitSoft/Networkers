import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, CheckCircle2, Clock3, Crown, ImagePlus, MessageCircle, Send, Users, X } from "lucide-react";
import { monthlyMeetingApi } from "../../api/meetingApi";
import { communityApi } from "../../api/communityApi";
import EmptyState from "../../components/EmptyState.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

function localToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export default function MyMeetings() {
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [monthly, setMonthly] = useState(null);
  const [error, setError] = useState("");
  const [edit, setEdit] = useState(null);
  const [pairForm, setPairForm] = useState(null);
  const [postForm, setPostForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [comment, setComment] = useState("");
  const load = () => monthlyMeetingApi.mine(month).then((value) => { setMonthly(value); setError(""); }).catch((requestError) => { setMonthly(null); setError(requestError.response?.data?.message || "No face-to-face group has been generated yet."); });
  useEffect(() => { load(); }, [month]);

  const isHost = monthly?.host.id === user?.id;
  const today = localToday();
  const ownPairs = useMemo(() => monthly?.pairMeetings.filter((pair) => pair.memberOne.id === user?.id || pair.memberTwo.id === user?.id) || [], [monthly, user?.id]);
  const otherPairs = useMemo(() => monthly?.pairMeetings.filter((pair) => pair.memberOne.id !== user?.id && pair.memberTwo.id !== user?.id) || [], [monthly, user?.id]);
  const uploadedPhotos = useMemo(() => monthly?.pairMeetings.filter((pair) => pair.photoUrl) || [], [monthly]);
  const canReport = isHost && monthly && (today > monthly.endDate || monthly.completionPercentage === 100) && !["COMPLETED", "INCOMPLETE"].includes(monthly.status);

  async function save(e) {
    e.preventDefault();
    if (edit.date < today || edit.endDate < today) return toast.error("Meeting dates cannot be in the past");
    if (edit.endDate < edit.date) return toast.error("End date cannot be before start date");
    try { await monthlyMeetingApi.edit(monthly.id, edit); setEdit(null); toast.success("Meeting window updated"); load(); } catch (requestError) { toast.error(requestError.response?.data?.message || "Could not update meeting window"); }
  }
  async function completePair(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const body = new FormData();
    body.append("metOn", pairForm.metOn);
    body.append("notes", pairForm.notes);
    if (pairForm.photo) body.append("photo", pairForm.photo);
    try { await monthlyMeetingApi.completePair(monthly.id, pairForm.id, body); setPairForm(null); toast.success("Meeting status updated to completed"); await load(); } catch (requestError) { toast.error(requestError.response?.data?.message || "Could not update meeting"); } finally { setBusy(false); }
  }
  async function publish(e) {
    e.preventDefault();
    setBusy(true);
    const body = new FormData();
    body.append("meetingId", monthly.id);
    body.append("caption", postForm.caption);
    if (postForm.file) body.append("file", postForm.file);
    else if (postForm.existingPhotoUrl) body.append("existingPhotoUrl", postForm.existingPhotoUrl);
    monthly.members.forEach((member) => body.append("mentionIds", member.id));
    try { await communityApi.create(body); setPostForm(null); toast.success("Face-to-face post published"); } catch (requestError) { toast.error(requestError.response?.data?.message || "Could not publish post"); } finally { setBusy(false); }
  }
  async function submitOutcome() {
    try { const updated = await monthlyMeetingApi.edit(monthly.id, { status: "COMPLETED" }); toast.success(`Meeting analysis completed at ${updated.completionPercentage}%`); await load(); } catch (requestError) { toast.error(requestError.response?.data?.message || "The meeting analysis is not available yet"); }
  }
  async function postComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    try { await monthlyMeetingApi.comment(monthly.id, comment); setComment(""); load(); } catch (requestError) { toast.error(requestError.response?.data?.message || "Could not comment"); }
  }

  return <div className="space-y-6">
    <header><p className="page-kicker">One-to-one networking</p><h1 className="mt-1 page-title">Face to <span className="text-brand-accent">Face</span></h1><p className="mt-2 text-sm text-brand-muted">Meet group members individually, update completion, and share professional meeting moments.</p><input aria-label="Meeting month" className="field mt-4 max-w-[210px]" type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></header>
    {!monthly ? <EmptyState title="Face-to-face meeting unavailable" message={error} /> : <>
      <section className="glass-card rounded-3xl p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><span className="status-pill">Group {monthly.groupNumber}</span><h2 className="mt-4 flex items-center gap-2 text-2xl font-bold"><Crown className="text-brand-accent" size={21} />{monthly.host.name}</h2><p className="text-sm text-brand-muted">Host · {monthly.chapterName}</p></div><span className="status-pill">{monthly.status}</span></div>
        <div className="mt-6 grid gap-3 md:grid-cols-3"><Info icon={CalendarDays} label="Meeting window" value={`${monthly.date} to ${monthly.endDate}`} /><Info icon={Users} label="Group" value={`${monthly.members.length} members · ${monthly.totalPairs} meetings`} /><Info icon={Clock3} label="Progress" value={`${monthly.completedPairs}/${monthly.totalPairs} · ${monthly.completionPercentage}%`} /></div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-brand-panel"><div className="h-full rounded-full bg-brand-accent transition-all" style={{ width: `${monthly.completionPercentage}%` }} /></div>
        {isHost && monthly.editCount < monthly.maxEdits && <button className="btn-primary mt-6" onClick={() => setEdit({ date: monthly.date, endDate: monthly.endDate, time: monthly.time, venue: monthly.venue || "" })}>Update meeting window ({monthly.maxEdits - monthly.editCount} edits left)</button>}
        {edit && <form onSubmit={save} className="mt-5 grid gap-3 rounded-2xl bg-brand-panel p-4 md:grid-cols-2"><label className="text-sm">Start date<input required min={today} className="field mt-1" type="date" value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value, endDate: edit.endDate < e.target.value ? e.target.value : edit.endDate })} /></label><label className="text-sm">End date (maximum 10 days)<input required min={edit.date > today ? edit.date : today} className="field mt-1" type="date" value={edit.endDate} onChange={(e) => setEdit({ ...edit, endDate: e.target.value })} /></label><input className="field" type="time" value={edit.time} onChange={(e) => setEdit({ ...edit, time: e.target.value })} /><input className="field" placeholder="Suggested venue / area (optional)" value={edit.venue} onChange={(e) => setEdit({ ...edit, venue: e.target.value })} /><div className="flex gap-2"><button className="btn-primary">Save window</button><button type="button" className="btn-muted" onClick={() => setEdit(null)}>Cancel</button></div></form>}
      </section>

      <PairSection title="Your one-to-one meetings" pairs={ownPairs} user={user} monthly={monthly} today={today} onUpdate={setPairForm} onPost={(pair) => setPostForm(defaultPost(monthly, pair))} />
      {isHost && <PairSection title="Other group one-to-one meetings" pairs={otherPairs} user={user} monthly={monthly} today={today} />}

      {isHost && <section className="glass-card rounded-3xl p-5 md:p-7"><h2 className="text-xl font-bold">Meeting Analysis</h2><p className="mt-2 text-sm text-brand-muted">{monthly.completedPairs} of {monthly.totalPairs} face-to-face meetings completed ({monthly.completionPercentage}%). Review group progress, finalize the analysis, or create one group post using an uploaded individual image.</p><div className="mt-5 flex flex-wrap gap-3">{canReport && <button className="btn-primary" onClick={submitOutcome}><CheckCircle2 size={17} /> Mark analysis completed</button>}<button className="btn-muted" onClick={() => setPostForm(defaultPost(monthly))}><Send size={17} /> Create group post</button></div></section>}

      <section className="glass-card rounded-3xl p-5 md:p-7"><h3 className="flex items-center gap-2 text-lg font-bold"><MessageCircle className="text-brand-accent" size={18} />Group discussion</h3><div className="mt-4 space-y-3">{monthly.comments.map((item) => <div className="rounded-2xl bg-brand-panel p-4" key={item.id}><p className="text-sm font-bold">{item.authorName}</p><p className="mt-1 text-sm text-brand-muted">{item.text}</p></div>)}</div><form onSubmit={postComment} className="mt-4 flex gap-2"><input className="field" placeholder="Comment for your group..." value={comment} onChange={(e) => setComment(e.target.value)} /><button className="btn-primary">Post</button></form></section>
    </>}

    {pairForm && <Modal onClose={() => !busy && setPairForm(null)}><form onSubmit={completePair}><h3 className="text-xl font-bold">Meeting Update: {pairForm.name}</h3><p className="mt-1 text-sm text-brand-muted">Mark the one-to-one meeting completed. Adding a photo is optional.</p><label className="mt-4 block text-sm font-bold">Meeting date<input required min={monthly.date} max={today < monthly.endDate ? today : monthly.endDate} className="field mt-1" type="date" value={pairForm.metOn} onChange={(e) => setPairForm({ ...pairForm, metOn: e.target.value })} /></label><textarea className="field mt-3" rows="3" placeholder="Meeting notes (optional)" value={pairForm.notes} onChange={(e) => setPairForm({ ...pairForm, notes: e.target.value })} /><label className="mt-3 flex cursor-pointer items-center gap-2 rounded-xl border border-brand-border/20 p-3 text-sm"><ImagePlus size={18} />Upload meeting photo (optional)<input className="hidden" type="file" accept="image/*" onChange={(e) => setPairForm({ ...pairForm, photo: e.target.files?.[0] || null })} />{pairForm.photo && <span className="truncate text-brand-accent">{pairForm.photo.name}</span>}</label><div className="mt-5 flex justify-end gap-2"><button type="button" className="btn-muted" onClick={() => setPairForm(null)}>Cancel</button><button className="btn-primary" disabled={busy}>{busy ? "Updating..." : "Mark completed"}</button></div></form></Modal>}
    {postForm && <Modal onClose={() => !busy && setPostForm(null)}><form onSubmit={publish}><div className="flex items-start justify-between gap-3"><div><h3 className="text-xl font-bold">{isHost ? "Create Face-to-Face Group Post" : "Create Individual Meeting Post"}</h3><p className="mt-1 text-sm text-brand-muted">Use an image already uploaded by the group, upload another image, or publish a text update.</p></div><button type="button" className="glass-icon" onClick={() => setPostForm(null)}><X size={17} /></button></div><textarea required className="field mt-4" rows="4" value={postForm.caption} onChange={(e) => setPostForm({ ...postForm, caption: e.target.value })} />{uploadedPhotos.length > 0 && <div className="mt-4 grid grid-cols-3 gap-2">{uploadedPhotos.map((pair) => <button type="button" className={`overflow-hidden rounded-xl border-2 ${postForm.existingPhotoUrl === pair.photoUrl ? "border-red-500" : "border-transparent"}`} key={pair.id} onClick={() => setPostForm({ ...postForm, existingPhotoUrl: pair.photoUrl, file: null })}><img src={pair.photoUrl} className="h-24 w-full object-cover" alt="Uploaded face-to-face meeting" /></button>)}</div>}<label className="field mt-4 block cursor-pointer"><input className="sr-only" type="file" accept="image/*,video/*" onChange={(e) => setPostForm({ ...postForm, file: e.target.files?.[0] || null, existingPhotoUrl: "" })} />{postForm.file?.name || "Upload a new image or video (optional)"}</label><button className="btn-primary mt-4 w-full justify-center" disabled={busy}>{busy ? "Publishing..." : "Publish post"}</button></form></Modal>}
  </div>;
}

function defaultPost(monthly, pair) {
  const pairName = pair ? `${pair.memberOne.name} and ${pair.memberTwo.name}` : `Face-to-Face Group ${monthly.groupNumber}`;
  return { caption: `${pairName} · ${monthly.chapterName}`, existingPhotoUrl: pair?.photoUrl || "", file: null };
}
function PairSection({ title, pairs, user, monthly, today, onUpdate, onPost }) {
  return <section className="glass-card rounded-3xl p-5 md:p-7"><h2 className="text-xl font-bold">{title}</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{pairs.map((pair) => { const belongs = pair.memberOne.id === user?.id || pair.memberTwo.id === user?.id; const person = belongs ? (pair.memberOne.id === user?.id ? pair.memberTwo : pair.memberOne) : null; const label = person?.name || `${pair.memberOne.name} + ${pair.memberTwo.name}`; return <article className={`rounded-2xl border p-4 ${pair.completed ? "border-green-500/25 bg-green-500/5" : "border-brand-border/20 bg-brand-panel"}`} key={pair.id}><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><Avatar member={person || pair.memberOne} /><div><p className="font-bold">{label}</p><p className="text-xs text-brand-muted">{pair.completed ? `Completed on ${pair.metOn}` : "Pending"}</p></div></div>{pair.completed ? <CheckCircle2 className="text-green-400" /> : <Clock3 className="text-brand-accent" />}</div>{pair.photoUrl && <img className="mt-3 h-36 w-full rounded-xl object-cover" src={pair.photoUrl} alt="One-to-one meeting" />}<div className="mt-4 flex flex-wrap gap-2">{!pair.completed && belongs && today >= monthly.date && today <= monthly.endDate && onUpdate && <button className="btn-primary flex-1 justify-center" onClick={() => onUpdate({ id: pair.id, name: label, metOn: today, notes: "", photo: null })}>Meeting Update</button>}{pair.completed && belongs && onPost && <button className="btn-muted flex-1 justify-center" onClick={() => onPost(pair)}><Send size={16} /> Create individual post</button>}</div></article>; })}{pairs.length === 0 && <p className="text-sm text-brand-muted">No meetings in this section.</p>}</div></section>;
}
function Modal({ children, onClose }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="card max-h-[90vh] w-full max-w-xl overflow-y-auto p-5 sm:p-6">{children}</div></div>; }
function Info({ icon: Icon, label, value }) { return <div className="rounded-2xl border border-brand-border/15 bg-brand-panel p-4"><Icon className="text-brand-accent" size={18} /><p className="mt-3 text-xs uppercase tracking-wider text-brand-muted">{label}</p><p className="mt-1 font-bold">{value}</p></div>; }
function Avatar({ member }) { return <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-brand-base">{member?.avatar ? <img className="h-full w-full object-cover" src={member.avatar} alt={member.name} /> : <span className="grid h-full place-items-center font-bold text-brand-accent">{member?.name?.[0] || "?"}</span>}</div>; }

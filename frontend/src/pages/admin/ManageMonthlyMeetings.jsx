import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { chapterApi } from "../../api/chapterApi";
import { monthlyMeetingApi } from "../../api/meetingApi";
import EmptyState from "../../components/EmptyState";

function localMonth(offset = 0) {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function ManageMonthlyMeetings() {
  const [searchParams] = useSearchParams();
  const [chapters, setChapters] = useState([]);
  const [chapterId, setChapterId] = useState("");
  const [month, setMonth] = useState(localMonth());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const upcomingMonths = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const value = localMonth(index);
    const [year, monthNumber] = value.split("-").map(Number);
    return { value, label: new Date(year, monthNumber - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) };
  }), []);

  useEffect(() => {
    chapterApi.all().then((data) => {
      setChapters(data);
      const requested = searchParams.get("chapterId");
      if (requested && data.some((chapter) => String(chapter.id) === requested)) setChapterId(requested);
      else if (data[0]) setChapterId(String(data[0].id));
    }).catch(() => setChapters([]));
  }, [searchParams]);
  useEffect(() => {
    if (chapterId) monthlyMeetingApi.adminOverview(chapterId, month).then(setItems).catch(() => setItems([]));
  }, [chapterId, month]);

  async function generate() {
    if (items.length && !confirm("Groups already exist for this month. Regenerating replaces groups, meetings, and their comments. Continue?")) return;
    setLoading(true);
    try {
      const data = await monthlyMeetingApi.regenerate(chapterId, month);
      setItems(data);
      toast.success(`Face-to-face groups generated for ${month}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not generate meetings");
    } finally {
      setLoading(false);
    }
  }

  async function remove(meeting) {
    if (!confirm(`Delete Group ${meeting.groupNumber} and all of its meetings for ${month}?`)) return;
    try {
      await monthlyMeetingApi.deleteGroup(meeting.id);
      setItems((current) => current.filter((item) => item.id !== meeting.id));
      toast.success("Meeting group permanently deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete meeting group");
    }
  }

  return <div className="space-y-5">
    <header><p className="page-kicker">Automation oversight</p><h1 className="page-title">Face to <span className="text-brand-accent">Face</span></h1><p className="mt-2 text-sm text-brand-muted">View, generate, or permanently delete one-to-one groups for the current and upcoming months.</p></header>
    <div className="card space-y-3 p-4">
      <div className="flex flex-wrap gap-3">
        <select className="field max-w-sm" value={chapterId} onChange={(event) => setChapterId(event.target.value)}><option value="">Select chapter</option>{chapters.map((chapter) => <option value={chapter.id} key={chapter.id}>{chapter.chapterName}</option>)}</select>
        <input className="field max-w-[190px]" type="month" min={upcomingMonths[0].value} value={month} onChange={(event) => setMonth(event.target.value)} />
        <button className="btn-primary" disabled={!chapterId || !month || loading} onClick={generate}>{loading ? "Generating..." : items.length ? "Regenerate selected month" : "Generate selected month now"}</button>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Upcoming months">{upcomingMonths.map((item) => <button type="button" key={item.value} className={month === item.value ? "btn-primary !min-h-9 !px-3 !py-1" : "btn-muted !min-h-9 !px-3 !py-1"} onClick={() => setMonth(item.value)}>{item.label}</button>)}</div>
    </div>
    <div className="grid gap-4 md:grid-cols-2">{items.map((meeting) => <article className="glass-card rounded-3xl p-5" key={meeting.id}>
      <div className="flex flex-wrap items-start justify-between gap-3"><h2 className="text-xl font-bold">Group {meeting.groupNumber}</h2><div className="flex flex-wrap items-center gap-2"><span className="status-pill">{meeting.status}</span><button type="button" className="btn-muted !min-h-9 !px-3 !py-1 text-red-500" onClick={() => remove(meeting)} aria-label={`Delete Group ${meeting.groupNumber}`}><Trash2 size={16} /> Delete</button></div></div>
      <p className="mt-4 font-bold text-brand-accent">Host: {meeting.host.name}</p><p className="mt-2 text-sm text-brand-muted">{meeting.date} to {meeting.endDate} · {meeting.time}</p><p className="mt-3 text-sm">{meeting.members.length} members · {meeting.completedPairs}/{meeting.totalPairs} meetings · {meeting.completionPercentage}%</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-panel"><div className="h-full bg-brand-accent" style={{ width: `${meeting.completionPercentage}%` }} /></div><div className="mt-3 flex flex-wrap gap-2">{meeting.members.map((member) => <span className="rounded-full bg-brand-panel px-3 py-1 text-xs" key={member.id}>{member.name}</span>)}</div>
    </article>)}</div>
    {items.length === 0 && <EmptyState title="No groups generated" message="Choose an upcoming month and click Generate selected month now." />}
  </div>;
}

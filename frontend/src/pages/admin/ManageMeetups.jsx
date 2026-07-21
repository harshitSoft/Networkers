import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { meetupApi } from "../../api/meetupApi";
import EmptyState from "../../components/EmptyState.jsx";
export default function ManageMeetups() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ status: "UPCOMING" });
  const [creating, setCreating] = useState(false);
  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const load = () => meetupApi.all().then((data) => setItems(Array.isArray(data) ? data : [])).catch(() => setItems([]));
  useEffect(() => { load(); }, []);
  async function submit(e) { e.preventDefault(); if (creating) return; if (!form.date || form.date < today) return toast.error("Past-date meetups cannot be created"); setCreating(true); try { await meetupApi.create(form); toast.success("Meetup created"); setForm({ status: "UPCOMING" }); load(); } catch (error) { toast.error(error.response?.data?.message || "Could not create meetup"); } finally { setCreating(false); } }
  return <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><form onSubmit={submit} className="card space-y-3 p-5"><h2 className="text-xl font-black">Create Meetup</h2>{["title","description","date","startTime","endTime","venue","city","maxAttendees","agenda"].map((f) => <input key={f} className="field" min={f === "date" ? today : undefined} required={["title","date"].includes(f)} type={f.includes("Time") ? "time" : f === "date" ? "date" : "text"} placeholder={f} value={form[f] || ""} onChange={(e) => setForm({ ...form, [f]: f === "maxAttendees" ? Number(e.target.value) : e.target.value })} />)}<button disabled={creating} className="btn-primary">{creating ? "Creating..." : "Create"}</button></form><div className="space-y-3">{items.map((m) => <div className="card p-4" key={m.id}><div className="flex items-start justify-between gap-3"><h3 className="font-bold">{m.title}</h3><span className="text-xs font-black text-red-600">{m.status}</span></div><p className="text-sm text-slate-500">{m.date} - {m.city}</p></div>)}{items.length === 0 && <EmptyState title="No meetups" message="Create the first networking meetup for members." />}</div></div>;
}

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { chapterApi } from "../../api/chapterApi";
import { eventApi } from "../../api/eventApi";
import { AdminTable } from "./ManageUsers.jsx";

const blank = { title: "", description: "", eventDate: "", eventTime: "", location: "", chapterId: "", eventType: "UPCOMING", imageUrl: "" };

export default function ManageEvents() {
  const [items, setItems] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [form, setForm] = useState(blank);
  const load = () => eventApi.all().then(setItems).catch(() => setItems([]));
  useEffect(() => { load(); chapterApi.all().then(setChapters).catch(() => setChapters([])); }, []);
  async function submit(e) {
    e.preventDefault();
    const event = await eventApi.create({ ...form, chapterId: form.chapterId ? Number(form.chapterId) : null });
    if (form.imageUrl) await eventApi.addImage(event.id, form.imageUrl);
    toast.success("Event created");
    setForm(blank);
    load();
  }
  async function remove(id) { await eventApi.remove(id); toast.success("Event deleted"); load(); }
  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="card p-5">
        <h2 className="text-2xl font-black">Events</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input className="field" required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="field" type="date" required value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
          <input className="field" type="time" value={form.eventTime} onChange={(e) => setForm({ ...form, eventTime: e.target.value })} />
          <input className="field" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <select className="field" value={form.chapterId} onChange={(e) => setForm({ ...form, chapterId: e.target.value })}><option value="">All chapters</option>{chapters.map((c) => <option key={c.id} value={c.id}>{c.chapterName}</option>)}</select>
          <select className="field" value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}><option value="UPCOMING">UPCOMING</option><option value="COMPLETED">COMPLETED</option></select>
          <input className="field md:col-span-3" placeholder="Image URL for gallery" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <textarea className="field md:col-span-3" rows="3" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <button className="btn-primary mt-4 bg-red-700 hover:bg-red-800">Create Event</button>
      </form>
      <AdminTable title="Events" items={items} render={(event) => (
        <>
          <td><p className="font-bold">{event.title}</p><p className="text-xs text-slate-500">{event.description}</p></td><td>{event.eventType}</td><td>{event.eventDate} {event.eventTime}</td><td>{event.location}</td><td>{event.images?.length || 0} images</td><td><button className="btn-muted text-red-600" onClick={() => remove(event.id)}>Delete</button></td>
        </>
      )} />
    </div>
  );
}

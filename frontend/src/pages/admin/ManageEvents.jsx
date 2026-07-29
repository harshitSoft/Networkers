import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { chapterApi } from "../../api/chapterApi";
import { eventApi } from "../../api/eventApi";
import { AdminTable } from "./ManageUsers.jsx";

const blank = {
  title: "",
  description: "",
  eventDate: "",
  eventTime: "",
  location: "",
  chapterId: "",
  imageUrl: "",
};

function localToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export default function ManageEvents() {
  const [items, setItems] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [form, setForm] = useState(blank);
  const [imageFile, setImageFile] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [attendanceFilter, setAttendanceFilter] = useState("ALL");
  const [creating, setCreating] = useState(false);
  const load = () =>
    eventApi
      .all()
      .then(setItems)
      .catch(() => setItems([]));
  useEffect(() => {
    load();
    chapterApi
      .all()
      .then(setChapters)
      .catch(() => setChapters([]));
  }, []);
  useEffect(() => {
    if (selectedEvent) {
      setAttendanceFilter("ALL");
      eventApi
        .rsvpList(selectedEvent.id)
        .then(setRsvps)
        .catch(() => setRsvps([]));
    }
  }, [selectedEvent]);
  async function submit(e) {
    e.preventDefault();
    if (creating) return;
    if (form.eventDate < localToday())
      return toast.error("Past-date events cannot be created");
    setCreating(true);
    try {
      const event = await eventApi.create({
        ...form,
        chapterId: form.chapterId ? Number(form.chapterId) : null,
        eventTime: form.eventTime || null,
        location: form.location.trim() || null,
        description: form.description.trim() || null,
      });
      if (form.imageUrl) await eventApi.addImage(event.id, form.imageUrl);
      if (imageFile) await eventApi.uploadImage(event.id, imageFile);
      toast.success("Event created");
      setForm(blank);
      setImageFile(null);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create event");
    } finally {
      setCreating(false);
    }
  }
  async function remove(id) {
    if (!window.confirm("Permanently delete this event for every member?")) return;
    try {
      await eventApi.remove(id);
      setItems((current) => current.filter((event) => event.id !== id));
      if (selectedEvent?.id === id) setSelectedEvent(null);
      toast.success("Event permanently deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete event");
    }
  }
  async function attendance(userId, status) {
    const updated = await eventApi.confirmAttendance(
      selectedEvent.id,
      userId,
      status,
    );
    setRsvps((v) => v.map((r) => (r.userId === userId ? updated : r)));
    toast.success("Attendance updated");
  }
  const counts = {
    GOING: rsvps.filter((r) => r.status === "GOING").length,
    NOT_GOING: rsvps.filter((r) => r.status === "NOT_GOING").length,
    PENDING: rsvps.filter((r) => r.status === "PENDING").length,
  };
  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="card p-5">
        <h2 className="text-2xl font-black">Events</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            className="field"
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            className="field"
            type="date"
            required
            min={localToday()}
            value={form.eventDate}
            onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
          />
          <input
            className="field"
            type="time"
            value={form.eventTime}
            onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
          />
          <input
            className="field"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <select
            className="field"
            value={form.chapterId}
            onChange={(e) => setForm({ ...form, chapterId: e.target.value })}
          >
            <option value="">All chapters</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.chapterName}
              </option>
            ))}
          </select>
          <input
            className="field md:col-span-2"
            placeholder="Image URL (optional)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          <label className="field cursor-pointer text-sm text-slate-400">
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
            {imageFile ? imageFile.name : "Upload event image"}
          </label>
          <textarea
            className="field md:col-span-3"
            rows="3"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <button
          disabled={creating}
          className="btn-primary mt-4 bg-red-700 hover:bg-red-800"
        >
          {creating ? "Creating Event..." : "Create Event"}
        </button>
      </form>
      <div className="flex gap-2">
        {["ALL", "UPCOMING", "COMPLETED"].map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={filter === value ? "btn-primary" : "btn-muted"}
          >
            {value}
          </button>
        ))}
      </div>
      <AdminTable
        title="Events"
        items={
          filter === "ALL"
            ? items
            : items.filter((event) => event.eventType === filter)
        }
        render={(event) => (
          <>
            <td>
              <p className="font-bold">{event.title}</p>
              <p className="line-clamp-1 text-xs text-slate-500">
                {event.description}
              </p>
            </td>
            <td>{event.eventType}</td>
            <td>
              {event.eventDate} {event.eventTime}
            </td>
            <td>{event.location}</td>
            <td>{event.images?.length || 0} images</td>
            <td>
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn-primary !px-3 !py-2"
                  onClick={() => setSelectedEvent(event)}
                >
                  View Attendance
                </button>
                <button
                  className="btn-muted !px-3 !py-2 text-red-600"
                  onClick={() => remove(event.id)}
                >
                  Delete
                </button>
              </div>
            </td>
          </>
        )}
      />
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Event details"
            className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="page-kicker">{selectedEvent.eventType}</p>
                <h2 className="mt-1 text-3xl font-black">
                  {selectedEvent.title}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close attendance details"
                className="glass-icon shrink-0"
                onClick={() => setSelectedEvent(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <p>
                <strong>Date:</strong> {selectedEvent.eventDate || "-"}
              </p>
              <p>
                <strong>Time:</strong> {selectedEvent.eventTime || "-"}
              </p>
              <p>
                <strong>Location:</strong> {selectedEvent.location || "-"}
              </p>
              <p>
                <strong>Chapter:</strong>{" "}
                {selectedEvent.chapter?.chapterName || "All chapters"}
              </p>
            </div>
            <p className="mt-5 whitespace-pre-wrap leading-7">
              {selectedEvent.description || "No description provided."}
            </p>
            <div className="mt-6 border-t border-red-500/20 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black">Event Attendance</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    All invited members are listed, including pending responses.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                    {counts.GOING} Attending
                  </span>
                  <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
                    {counts.NOT_GOING} Not attending
                  </span>
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
                    {counts.PENDING} Pending
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ["ALL", "All"],
                  ["GOING", "Attending"],
                  ["NOT_GOING", "Not attending"],
                  ["PENDING", "Pending"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={
                      attendanceFilter === value ? "btn-primary" : "btn-muted"
                    }
                    onClick={() => setAttendanceFilter(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {rsvps
                  .filter(
                    (r) =>
                      attendanceFilter === "ALL" ||
                      r.status === attendanceFilter,
                  )
                  .map((r) => (
                    <div
                      key={r.userId}
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 p-3"
                    >
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-red-500/10">
                        {r.avatar ? (
                          <img
                            src={r.avatar}
                            alt={r.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="grid h-full place-items-center font-bold text-red-400">
                            {r.name?.[0]}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">{r.name}</p>
                        <p className="text-xs text-slate-500">
                          {r.businessName || "Member"}
                        </p>
                      </div>
                      <select
                        className="field !w-auto"
                        value={r.status}
                        onChange={(e) => attendance(r.userId, e.target.value)}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="GOING">Attending</option>
                        <option value="NOT_GOING">Not attending</option>
                        <option value="ATTENDED">Attended (confirmed)</option>
                      </select>
                    </div>
                  ))}
                {rsvps.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No eligible members found for this event.
                  </p>
                )}
              </div>
            </div>
            {selectedEvent.images?.length > 0 && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {selectedEvent.images.map((item, index) => (
                  <img
                    className="h-48 w-full rounded-xl object-cover"
                    key={item.id || index}
                    src={item.imageUrl || item}
                    alt={`${selectedEvent.title} ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

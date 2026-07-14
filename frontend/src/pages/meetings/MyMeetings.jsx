import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { meetingApi } from "../../api/meetingApi";
import { businessApi } from "../../api/businessApi";
import EmptyState from "../../components/EmptyState.jsx";

export default function MyMeetings() {
  const [data, setData] = useState({ received: [], sent: [], businesses: [] });
  const [form, setForm] = useState({});
  const load = () => Promise.allSettled([meetingApi.received(), meetingApi.sent(), businessApi.all()]).then(([received, sent, businesses]) => setData({
    received: received.status === "fulfilled" && Array.isArray(received.value) ? received.value : [],
    sent: sent.status === "fulfilled" && Array.isArray(sent.value) ? sent.value : [],
    businesses: businesses.status === "fulfilled" && Array.isArray(businesses.value) ? businesses.value : []
  }));
  useEffect(() => { load(); }, []);
  async function submit(e) { e.preventDefault(); await meetingApi.request(form); toast.success("Meeting requested"); setForm({}); load(); }
  async function action(id, name) { await meetingApi[name](id); toast.success("Meeting updated"); load(); }
  return <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
    <form onSubmit={submit} className="card space-y-3 p-5"><h2 className="text-xl font-black">Request Meeting</h2><select className="field" value={form.receiverId || ""} onChange={(e) => setForm({ ...form, receiverId: Number(e.target.value) })}><option value="">Select owner</option>{data.businesses.map((b) => <option key={b.id} value={b.user?.id}>{b.ownerName || b.user?.fullName || "Business owner"} - {b.businessName}</option>)}</select><input className="field" type="date" onChange={(e) => setForm({ ...form, meetingDate: e.target.value })} /><input className="field" type="time" onChange={(e) => setForm({ ...form, meetingTime: e.target.value })} /><input className="field" placeholder="Purpose" value={form.purpose || ""} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /><button className="btn-primary">Send request</button></form>
    <div className="space-y-4"><MeetingList title="Received" items={data.received} action={action} /><MeetingList title="Sent" items={data.sent} /></div>
  </div>;
}

function MeetingList({ title, items, action }) {
  return <section className="card p-5"><h2 className="text-xl font-black">{title}</h2><div className="mt-3 space-y-2">{items.map((m) => <div key={m.id} className="rounded-lg border p-3"><p className="font-bold">{m.requester?.fullName || "Member"} to {m.receiver?.fullName || "Member"}</p><p className="text-sm text-slate-500">{m.purpose} - {m.status}</p>{action && m.status === "PENDING" && <div className="mt-2 flex gap-2"><button className="btn-primary" onClick={() => action(m.id, "accept")}>Accept</button><button className="btn-muted" onClick={() => action(m.id, "reject")}>Reject</button></div>}</div>)}</div>{items.length === 0 && <EmptyState title={`No ${title.toLowerCase()} meetings`} message="Meeting requests with business owners will appear here." />}</section>;
}

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { notificationApi } from "../../api/notificationApi";
import EmptyState from "../../components/EmptyState.jsx";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const load = () => notificationApi.all().then((data) => setItems(Array.isArray(data) ? data : [])).catch(() => setItems([]));
  useEffect(() => { load(); }, []);
  async function readAll() { await notificationApi.readAll(); toast.success("Notifications marked read"); load(); }
  return <div className="space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-2xl font-black">Notifications</h2><button className="btn-primary w-full sm:w-auto" onClick={readAll}>Read all</button></div>{items.map((n) => <div key={n.id} className={`card p-4 ${n.read ? "opacity-70" : ""}`}><h3 className="break-words font-bold">{n.title}</h3><p className="break-words text-sm text-slate-500">{n.message}</p></div>)}{items.length === 0 && <EmptyState title="No notifications" message="Connection updates, referrals, meetups, and admin messages will appear here." />}</div>;
}

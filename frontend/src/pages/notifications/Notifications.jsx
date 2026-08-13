import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { notificationApi } from "../../api/notificationApi";
import EmptyState from "../../components/EmptyState.jsx";
import Loader from "../../components/Loader.jsx";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [info, setInfo] = useState({ totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); return notificationApi.page(page, 20).then((data) => { setItems(data?.content || []); setInfo({ totalPages: data?.totalPages || 0, totalElements: data?.totalElements || 0 }); }).catch(() => { setItems([]); }).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, [page]);
  async function readAll() { await notificationApi.readAll(); toast.success("Notifications marked read"); load(); }
  return <div className="space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-black">Notifications</h2><p className="text-sm text-brand-muted">{info.totalElements} total</p></div><button className="btn-primary w-full sm:w-auto" onClick={readAll}>Read all</button></div>{loading?<Loader label="Loading notifications"/>:items.map((n) => <div key={n.id} className={`card p-4 ${n.read ? "opacity-70" : ""}`}><h3 className="break-words font-bold">{n.title}</h3><p className="break-words text-sm text-slate-500">{n.message}</p></div>)}{!loading&&items.length === 0 && <EmptyState title="No notifications" message="Connection updates, referrals, meetups, and admin messages will appear here." />}{!loading&&info.totalPages>1&&<div className="flex items-center justify-center gap-3"><button className="btn-muted" disabled={page===0} onClick={()=>setPage(page-1)}>Previous</button><span className="text-sm text-brand-muted">Page {page+1} of {info.totalPages}</span><button className="btn-primary" disabled={page+1>=info.totalPages} onClick={()=>setPage(page+1)}>Next</button></div>}</div>;
}

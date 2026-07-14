import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import EmptyState from "../../components/EmptyState.jsx";

export default function ManageUsers() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const load = () => adminApi.users().then((data) => setItems(Array.isArray(data) ? data : [])).catch(() => setItems([]));
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => {
    const text = query.toLowerCase();
    return items.filter((u) => [u.fullName, u.email, u.businessName, u.businessCategory, u.chapter?.chapterName, u.chapterName].some((value) => String(value || "").toLowerCase().includes(text)));
  }, [items, query]);
  async function toggle(u) {
    await (u.enabled ? adminApi.block(u.id) : adminApi.unblock(u.id));
    toast.success(u.enabled ? "User deactivated" : "User activated");
    load();
  }
  async function confirmDelete() {
    await adminApi.deleteUser(deleteTarget.id);
    toast.success("User deleted");
    setDeleteTarget(null);
    load();
  }
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white p-5 shadow-premium md:flex md:items-center md:justify-between">
        <div>
          <p className="page-kicker">Member management</p>
          <h2 className="mt-1 page-title">Users</h2>
          <p className="mt-1 text-sm text-slate-500">Manage member accounts, status, chapter assignment, and business profile data.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={17} />
          <input className="field pl-9" placeholder="Search users" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>
      <AdminTable title="User Directory" items={filtered} render={(u) => (
        <>
          <td><p className="font-bold">{u.fullName}</p><p className="text-xs text-slate-500">{u.email}</p></td>
          <td>{u.businessName || "-"}<p className="text-xs text-slate-500">{u.businessCategory || "-"}</p></td>
          <td>{u.chapter?.chapterName || u.chapterName || "-"}</td>
          <td>{u.subscriptionPlan || "-"}</td>
          <td><span className={`rounded-full px-3 py-1 text-xs font-black ${u.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{u.enabled ? "Active" : "Inactive"}</span></td>
          <td><div className="flex flex-wrap gap-2"><button className="btn-muted" onClick={() => toggle(u)}>{u.enabled ? "Deactivate" : "Activate"}</button><button className="btn-muted">Edit</button><button className="btn-muted text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(u)}>Delete</button></div></td>
        </>
      )} />
      {deleteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-black">Delete User</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Delete {deleteTarget.fullName}? The account will be disabled and hidden.</p>
            <div className="mt-6 flex justify-end gap-2"><button className="btn-muted" onClick={() => setDeleteTarget(null)}>Cancel</button><button className="btn-primary" onClick={confirmDelete}>Delete</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminTable({ title, items, render }) {
  return <div className="card max-w-full overflow-hidden"><h2 className="p-5 text-2xl font-black">{title}</h2>{items.length > 0 ? <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><tbody>{items.map((item) => <tr className="border-t align-top [&>td]:p-4" key={item.id}>{render(item)}</tr>)}</tbody></table></div> : <div className="p-5"><EmptyState title={`No ${title.toLowerCase()}`} message="Records will appear here." /></div>}</div>;
}

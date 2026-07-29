import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Ban, Check, Pencil, Search, Trash2, X } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import EmptyState from "../../components/EmptyState.jsx";
import { chapterApi } from "../../api/chapterApi";
import { normalizePhone } from "../../utils/formValues.js";
import PasswordField from "../../components/PasswordField.jsx";

export default function ManageUsers() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [chapters, setChapters] = useState([]);
  const load = () => adminApi.users().then((data) => setItems(Array.isArray(data) ? data : [])).catch(() => setItems([]));
  useEffect(() => { load(); chapterApi.all().then(setChapters).catch(() => setChapters([])); }, []);
  const filtered = useMemo(() => {
    const text = query.toLowerCase();
    return items.filter((u) => [u.fullName, u.email, u.businessName, u.businessCategory, u.chapter?.chapterName, u.chapterName].some((value) => String(value || "").toLowerCase().includes(text)));
  }, [items, query]);
  useEffect(() => { setPage(1); }, [query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const visible = filtered.slice((page - 1) * 10, page * 10);
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);
  async function toggle(u) {
    await (u.enabled ? adminApi.block(u.id) : adminApi.unblock(u.id));
    toast.success(u.enabled ? "User deactivated" : "User activated");
    load();
  }
  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await adminApi.deleteUser(deleteTarget.id);
      setItems((current) => current.filter((user) => user.id !== deleteTarget.id));
      toast.success("User deleted");
      setDeleteTarget(null);
    } catch (error) { toast.error(error.response?.data?.message || "Could not delete user"); }
    finally { setDeleting(false); }
  }
  function startEdit(user) {
    setEditTarget({ fullName: user.fullName || "", email: user.email || "", mobile: normalizePhone(user.mobile), businessName: user.businessName || "", businessCategory: user.businessCategory || "", services: user.services || "", location: user.location || "", chapterId: String(user.chapter?.id || user.chapterId || ""), role: user.role || "USER", enabled: user.enabled !== false, subscriptionStartDate: user.subscriptionStartDate || "", subscriptionEndDate: user.subscriptionEndDate || "", password: "", id: user.id });
  }
  async function saveEdit(e) {
    e.preventDefault();
    if (!editTarget.chapterId) return toast.error("A chapter assignment is required");
    if (editTarget.mobile && !/^\d{10}$/.test(editTarget.mobile)) return toast.error("Enter a valid 10-digit mobile number");
    setSaving(true);
    try {
      const updated = await adminApi.updateUser(editTarget.id, { ...editTarget, email: editTarget.email.trim().toLowerCase(), chapterId: Number(editTarget.chapterId) });
      setItems((current) => current.map((user) => user.id === updated.id ? updated : user));
      toast.success("User updated everywhere");
      setEditTarget(null);
    } catch (error) { toast.error(error.response?.data?.message || "Could not update user"); }
    finally { setSaving(false); }
  }
  return (
    <div className="space-y-5">
      <div className="admin-surface rounded-2xl p-5 shadow-premium md:flex md:items-center md:justify-between">
        <div>
          <p className="page-kicker">Member management</p>
          <h2 className="mt-1 page-title">Users</h2>
          <p className="mt-1 text-sm text-slate-500">Manage member accounts, status, chapter assignment, and business profile data.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted transition-colors peer-focus:text-brand-accent" size={17} />
          <input className="field peer !pl-10" placeholder="Search users" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>
      <AdminTable title="User Directory" items={visible} render={(u) => (
        <>
          <td><p className="font-bold">{u.fullName}</p><p className="text-xs text-slate-500">{u.email}</p></td>
          <td>{u.businessName || "-"}<p className="text-xs text-slate-500">{u.businessCategory || "-"}</p></td>
          <td>{u.chapter?.chapterName || u.chapterName || "Unassigned"}</td>
          <td><span className={`rounded-full px-3 py-1 text-xs font-black ${u.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{u.enabled ? "Active" : "Inactive"}</span></td>
          <td><div className="flex flex-wrap gap-2">
            <button className="btn-muted !h-9 !min-h-9 !w-9 !p-0" onClick={() => toggle(u)} aria-label={u.enabled ? `Deactivate ${u.fullName}` : `Activate ${u.fullName}`} title={u.enabled ? "Deactivate" : "Activate"}>{u.enabled ? <Ban size={16} /> : <Check size={16} />}</button>
            <button className="btn-muted !h-9 !min-h-9 !w-9 !p-0" onClick={() => startEdit(u)} aria-label={`Edit ${u.fullName}`} title="Edit"><Pencil size={16} /></button>
            <button className="btn-muted !h-9 !min-h-9 !w-9 !p-0 text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(u)} aria-label={`Delete ${u.fullName}`} title="Delete"><Trash2 size={16} /></button>
          </div></td>
        </>
      )} />
      {filtered.length > 10 && <Pagination page={page} pageCount={pageCount} onPage={setPage} />}
      {editTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" onClick={() => !saving && setEditTarget(null)}>
          <form className="card max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6" onSubmit={saveEdit} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><div><p className="page-kicker">Member management</p><h3 className="mt-1 text-2xl font-black">Edit User</h3></div><button type="button" className="btn-muted" onClick={() => setEditTarget(null)} disabled={saving}><X size={18} /></button></div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[["fullName","Full name","text"],["email","Email","email"],["mobile","Mobile","tel"],["businessName","Business name","text"],["businessCategory","Business category/work","text"],["services","Services","text"],["location","Location","text"],["subscriptionStartDate","Subscription start date","date"],["subscriptionEndDate","Subscription end date","date"]].map(([key,label,type]) => <label key={key}><span className="mb-1 block text-xs font-bold uppercase text-slate-500">{label}</span><input name={key} className="field" type={type} required={["fullName","email","mobile"].includes(key)} value={editTarget[key]} onChange={({ currentTarget: { value } }) => setEditTarget((current) => ({ ...current, [key]: key === "mobile" ? normalizePhone(value) : value }))} /></label>)}
              <label><span className="mb-1 block text-xs font-bold uppercase text-slate-500">New password (optional)</span><PasswordField name="password" minLength="8" placeholder="Leave blank to keep current password" value={editTarget.password} onChange={(e) => setEditTarget({ ...editTarget, password: e.target.value })} /></label>
              <label><span className="mb-1 block text-xs font-bold uppercase text-slate-500">Chapter</span><select required className="field" value={editTarget.chapterId} onChange={(e) => setEditTarget({ ...editTarget, chapterId: e.target.value })}><option value="">Assign chapter</option>{chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.chapterName}</option>)}</select></label>
            </div>
            <p className="mt-3 text-xs text-slate-500">If the email changes, the member must sign in with the new email. Leave the password blank to preserve the current password.</p>
            <div className="mt-6 flex justify-end gap-2"><button type="button" className="btn-muted" onClick={() => setEditTarget(null)} disabled={saving}>Cancel</button><button className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button></div>
          </form>
        </div>
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div className="card w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-black">Delete User</h3>
            <p className="mt-3 text-sm leading-6 text-brand-muted">Delete {deleteTarget.fullName}? The account and its related database records will be permanently removed.</p>
            <div className="mt-6 flex justify-end gap-2"><button className="btn-muted" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button><button className="btn-primary" onClick={confirmDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Pagination({ page, pageCount, onPage }) {
  return <nav className="flex items-center justify-center gap-3" aria-label="Pagination"><button className="btn-muted" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button><span className="text-sm font-bold">Page {page} of {pageCount}</span><button className="btn-muted" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>Next</button></nav>;
}

export function AdminTable({ title, items, render }) {
  return <div className="card max-w-full overflow-hidden"><h2 className="p-5 text-2xl font-black">{title}</h2>{items.length > 0 ? <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><tbody>{items.map((item) => <tr className="border-t align-top [&>td]:p-4" key={item.id}>{render(item)}</tr>)}</tbody></table></div> : <div className="p-5"><EmptyState title={`No ${title.toLowerCase()}`} message="Records will appear here." /></div>}</div>;
}

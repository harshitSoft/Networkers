import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Edit3, Eye, Trash2, Users } from "lucide-react";
import { chapterApi } from "../../api/chapterApi";
import GlowCard from "../../components/ui/GlowCard.jsx";
import { Pagination } from "./ManageUsers.jsx";

const blank = { chapterNumber: "", chapterName: "", description: "", subscriptionName: "", subscriptionAmount: "", active: true };

export default function ManageChapters() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [members, setMembers] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / 4));
  const visibleItems = items.slice((page - 1) * 4, page * 4);
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);
  const load = () => chapterApi.all().then(setItems).catch(() => setItems([]));
  useEffect(() => { load(); }, []);
  async function submit(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const payload = { ...form, chapterNumber: Number(form.chapterNumber), subscriptionAmount: Number(form.subscriptionAmount), active: true };
    try {
      if (editingId) {
        await chapterApi.update(editingId, payload);
        toast.success("Chapter updated");
      } else {
        const chapter = await chapterApi.create(payload);
        if (bannerFile) await chapterApi.uploadBanner(chapter.id, bannerFile);
        toast.success("Chapter created");
      }
      setForm(blank);
      setEditingId(null);
      setBannerFile(null);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save chapter");
    } finally {
      setSaving(false);
    }
  }
  function edit(chapter) {
    setEditingId(chapter.id);
    setForm({ chapterNumber: chapter.chapterNumber, chapterName: chapter.chapterName, description: chapter.description, subscriptionName: chapter.subscriptionName, subscriptionAmount: chapter.subscriptionAmount, active: chapter.active });
  }
  async function viewMembers(chapter) {
    const data = await chapterApi.members(chapter.id);
    setMembers({ chapter, data: Array.isArray(data) ? data : [] });
  }
  async function remove(id) { await chapterApi.remove(id); toast.success("Chapter deactivated"); load(); }
  return (
    <div className="manage-chapters min-h-full rounded-3xl border border-red-500/25 bg-gradient-to-br from-[#FFF1F2] via-white to-[#FFF7F7] p-4 shadow-[0_0_24px_rgba(225,6,0,.1)] md:p-6">
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={submit} className="chapter-form rounded-2xl border border-red-500/25 bg-white/90 p-5 shadow-[0_0_22px_rgba(225,6,0,.12)] backdrop-blur">
          <p className="text-sm font-black uppercase text-red-700">Chapter setup</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">{editingId ? "Edit Chapter" : "Create Chapter"}</h2>
          <div className="mt-5 grid gap-3">
            {[
              ["chapterNumber", "Chapter number"], ["chapterName", "Chapter name"],
              ["subscriptionName", "Subscription name"], ["subscriptionAmount", "Subscription amount"]
            ].map(([key, label]) => <input key={key} required className="field border-red-100 focus:border-red-600 focus:ring-red-600/10" placeholder={label} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}
            <textarea className="field border-red-100 focus:border-red-600 focus:ring-red-600/10" rows="4" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label className="field cursor-pointer text-sm text-slate-400"><input className="sr-only" type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />{bannerFile ? bannerFile.name : "Upload chapter banner (optional)"}</label>
          </div>
          <div className="mt-5 flex gap-2">
            <button disabled={saving} className="btn-primary bg-gradient-to-r from-[#7F1D1D] to-[#B91C1C] hover:from-[#7F1D1D] hover:to-[#F97316]">{saving ? "Saving..." : editingId ? "Save Changes" : "Create Chapter"}</button>
            {editingId && <button type="button" className="btn-muted" onClick={() => { setEditingId(null); setForm(blank); }}>Cancel</button>}
          </div>
        </form>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-black">Chapters</h2>
            <p className="mt-1 text-sm text-slate-500">Premium subscription chapters managed by admins.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {visibleItems.map((chapter) => (
              <GlowCard as="article" key={chapter.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase text-red-700">Chapter {chapter.chapterNumber}</p>
                    <h3 className="mt-1 text-xl font-black">{chapter.chapterName}</h3>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${chapter.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{chapter.active ? "Active" : "Inactive"}</span>
                </div>
                <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">{chapter.description}</p>
                <div className="mt-4 grid gap-3 rounded-xl bg-gradient-to-r from-[#FFF1F2] to-white p-4 text-sm">
                  <p><span className="font-black">Plan:</span> {chapter.subscriptionName}</p>
                  <p><span className="font-black text-red-700">Amount:</span> Rs {Number(chapter.subscriptionAmount || 0).toLocaleString("en-IN")}</p>
                  <p><span className="font-black text-red-700">Members:</span> {chapter.memberCount}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn-muted" onClick={() => viewMembers(chapter)}><Eye size={16} /> View Members</button>
                  <button className="btn-muted" onClick={() => edit(chapter)}><Edit3 size={16} /> Edit</button>
                  <button className="btn-muted text-red-700 hover:bg-red-50" onClick={() => remove(chapter.id)}><Trash2 size={16} /> Delete</button>
                </div>
              </GlowCard>
            ))}
          </div>
          {items.length > 4 && <div className="mt-5"><Pagination page={page} pageCount={pageCount} onPage={setPage} /></div>}
        </section>
      </div>
      {members && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div role="dialog" aria-modal="true" className="card max-h-[85vh] w-full max-w-3xl overflow-y-auto p-6">
            <div className="flex items-start justify-between gap-4">
              <div><h3 className="text-2xl font-black">{members.chapter.chapterName}</h3><p className="text-sm text-slate-500">Chapter members</p></div>
              <button className="btn-muted" onClick={() => setMembers(null)}>Close</button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {members.data.map((member) => <div className="chapter-member-card rounded-xl border border-red-100 p-4" key={member.id}><Users className="text-red-700" size={20} /><p className="mt-2 font-black">{member.fullName}</p><p className="text-sm text-slate-600">{member.businessName} | {member.businessCategory}</p></div>)}
              {members.data.length === 0 && <p className="text-sm text-slate-500">No members assigned yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

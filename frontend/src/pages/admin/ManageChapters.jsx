import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Edit3, Eye, Trash2, Users } from "lucide-react";
import { chapterApi } from "../../api/chapterApi";
import GlowCard from "../../components/ui/GlowCard.jsx";
import { Pagination } from "./ManageUsers.jsx";

const blank = {
  chapterNumber: "",
  chapterName: "",
  description: "",
  subscriptionName: "",
  subscriptionAmount: "",
  active: true,
};

export default function ManageChapters() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [members, setMembers] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / 3));
  const visibleItems = items.slice((page - 1) * 3, page * 3);
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);
  const load = () =>
    chapterApi
      .all()
      .then(setItems)
      .catch(() => setItems([]));
  useEffect(() => {
    load();
  }, []);
  async function submit(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const payload = {
      ...form,
      chapterNumber: Number(form.chapterNumber),
      subscriptionAmount: Number(form.subscriptionAmount),
      active: true,
    };
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
    setForm({
      chapterNumber: chapter.chapterNumber,
      chapterName: chapter.chapterName,
      description: chapter.description,
      subscriptionName: chapter.subscriptionName,
      subscriptionAmount: chapter.subscriptionAmount,
      active: chapter.active,
    });
  }
  async function viewMembers(chapter) {
    const data = await chapterApi.members(chapter.id);
    setMembers({ chapter, data: Array.isArray(data) ? data : [] });
  }
  async function remove(id) {
    await chapterApi.remove(id);
    toast.success("Chapter deactivated");
    load();
  }
  return (
    <div className="manage-chapters min-h-full rounded-3xl border border-red-500/25 bg-gradient-to-br from-[#FFF1F2] via-white to-[#FFF7F7] p-4 shadow-[0_0_24px_rgba(225,6,0,.1)] md:p-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-red-500/15 pb-6">
        <div>
          <p className="page-kicker">Chapter management</p>
          <h1 className="mt-1 text-3xl font-black">Manage Chapters</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Create, update, and review every chapter from one organized
            workspace.
          </p>
        </div>
        <div className="rounded-2xl border border-red-500/20 px-4 py-3 text-right">
          <p className="font-data text-2xl font-black text-red-600">
            {items.length}
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total chapters
          </p>
        </div>
      </header>

      <div className="space-y-8">
        <form
          onSubmit={submit}
          className="chapter-form rounded-2xl border border-red-500/25 bg-white/90 p-5 shadow-[0_0_22px_rgba(225,6,0,.12)] backdrop-blur"
        >
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-red-500/15 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-red-700">
                Chapter setup
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                {editingId ? "Edit chapter" : "Create a new chapter"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {editingId
                  ? "Update the selected chapter details."
                  : "Add the basic chapter and subscription details."}
              </p>
            </div>
          </div>
          <div className="mt-5 grid items-end gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["chapterNumber", "Chapter number", "number"],
              ["chapterName", "Chapter name", "text"],
              ["subscriptionName", "Subscription name", "text"],
              ["subscriptionAmount", "Subscription amount", "number"],
            ].map(([key, label, type]) => (
              <label className="grid gap-1.5" key={key}>
                <span className="text-xs font-bold text-slate-600">
                  {label}
                </span>
                <input
                  type={type}
                  min={type === "number" ? "0" : undefined}
                  required
                  className="field border-red-100 focus:border-red-600 focus:ring-red-600/10"
                  placeholder={`Enter ${label.toLowerCase()}`}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
            <label className="grid gap-1.5 xl:col-span-2">
              <span className="text-xs font-bold text-slate-600">
                Description
              </span>
              <textarea
                className="field min-h-[46px] resize-y border-red-100 focus:border-red-600 focus:ring-red-600/10"
                rows="1"
                placeholder="Describe this chapter"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
            <label className="grid gap-1.5 xl:col-span-2">
              <span className="text-xs font-bold text-slate-600">
                Chapter banner{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </span>
              <span className="field cursor-pointer truncate text-sm text-slate-400">
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                />
                {bannerFile ? bannerFile.name : "Choose an image"}
              </span>
            </label>
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-red-500/15 pt-5">
            <button
              disabled={saving}
              className="btn-primary min-w-44 bg-gradient-to-r from-[#7F1D1D] to-[#B91C1C] hover:from-[#7F1D1D] hover:to-[#F97316]"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Create chapter"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn-muted"
                onClick={() => {
                  setEditingId(null);
                  setForm(blank);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">All chapters</h2>
              <p className="mt-1 text-sm text-slate-500">
                View membership, subscription, and status details.
              </p>
            </div>
            <p className="rounded-full border border-red-500/20 px-3 py-1.5 text-xs font-bold text-slate-500">
              Showing {visibleItems.length} of {items.length}
            </p>
          </div>
          <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((chapter) => (
              <GlowCard as="article" className="h-full" key={chapter.id}>
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3 border-b border-red-500/10 pb-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-red-700">
                        Chapter {chapter.chapterNumber}
                      </p>
                      <h3 className="mt-1 text-xl font-black">
                        {chapter.chapterName}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${chapter.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {chapter.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">
                    {chapter.description || "No description provided."}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-gradient-to-r from-[#FFF1F2] to-white p-4 text-sm">
                    <div className="col-span-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Subscription
                      </p>
                      <p className="mt-1 font-black">
                        {chapter.subscriptionName || "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Amount
                      </p>
                      <p className="mt-1 font-black text-red-700">
                        Rs{" "}
                        {Number(chapter.subscriptionAmount || 0).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Members
                      </p>
                      <p className="mt-1 font-black text-red-700">
                        {chapter.memberCount || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <button
                      type="button"
                      className="btn-muted flex-1 !px-3 !py-2"
                      onClick={() => viewMembers(chapter)}
                    >
                      <Eye size={16} /> Members
                    </button>
                    <button
                      type="button"
                      className="btn-muted !px-3 !py-2"
                      onClick={() => edit(chapter)}
                    >
                      <Edit3 size={16} /> Edit
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${chapter.chapterName}`}
                      className="btn-muted !px-3 !py-2 text-red-700 hover:bg-red-50"
                      onClick={() => remove(chapter.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </GlowCard>
            ))}
            {items.length === 0 && (
              <div className="card col-span-full p-10 text-center">
                <Users className="mx-auto text-red-600" />
                <h3 className="mt-3 text-lg font-black">
                  No chapters created yet
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Use the form to create your first chapter.
                </p>
              </div>
            )}
          </div>
          {items.length > 3 && (
            <div className="mt-5">
              <Pagination page={page} pageCount={pageCount} onPage={setPage} />
            </div>
          )}
        </section>
      </div>
      {members && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="card max-h-[85vh] w-full max-w-3xl overflow-y-auto p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black">
                  {members.chapter.chapterName}
                </h3>
                <p className="text-sm text-slate-500">Chapter members</p>
              </div>
              <button className="btn-muted" onClick={() => setMembers(null)}>
                Close
              </button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {members.data.map((member) => (
                <div
                  className="chapter-member-card rounded-xl border border-red-100 p-4"
                  key={member.id}
                >
                  <Users className="text-red-700" size={20} />
                  <p className="mt-2 font-black">{member.fullName}</p>
                  <p className="text-sm text-slate-600">
                    {member.businessName} | {member.businessCategory}
                  </p>
                </div>
              ))}
              {members.data.length === 0 && (
                <p className="text-sm text-slate-500">
                  No members assigned yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

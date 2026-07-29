import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import { chapterApi } from "../../api/chapterApi";
import ManageUsers from "./ManageUsers.jsx";
import PasswordField from "../../components/PasswordField.jsx";
import { normalizePhone } from "../../utils/formValues.js";

const blank = { fullName: "", email: "", mobile: "", password: "", role: "USER", businessName: "", businessCategory: "", services: "", location: "", chapterId: "", subscriptionPlan: "", subscriptionStartDate: "", subscriptionEndDate: "", enabled: true };

export default function CreateUser() {
  const [chapters, setChapters] = useState([]);
  const [form, setForm] = useState(blank);
  const [created, setCreated] = useState(null);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  useEffect(() => { chapterApi.all().then(setChapters).catch(() => setChapters([])); }, []);
  async function submit(e) {
    e.preventDefault();
    if (chapters.length === 0) return toast.error("Create a chapter before creating users");
    if (!form.chapterId) return toast.error("A chapter assignment is required");
    if (!/^\d{10}$/.test(form.mobile)) return toast.error("Enter a valid 10-digit mobile number");
    setCreating(true);
    try {
      const user = await adminApi.createUser({ ...form, chapterId: Number(form.chapterId) });
      setCreated({ user, password: form.password });
      toast.success("User created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create user");
    } finally {
      setCreating(false);
    }
  }
  async function sendCredentials() {
    setSending(true);
    try {
      await adminApi.sendCredentials(created.user.id, created.password);
      toast.success(`Credentials sent to ${created.user.email}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send credentials. You can retry.");
    } finally {
      setSending(false);
    }
  }
  function createAnother() {
    setCreated(null);
    setForm(blank);
  }
  return (
    <div className="space-y-6"><form onSubmit={submit} className="card p-6">
      <p className="page-kicker">Admin action</p>
      <h2 className="mt-1 page-title">Create <span className="text-[#E8262A]">User</span></h2>
      <p className="mt-1 text-sm text-slate-500">Create the account first. Credential email can be sent separately after successful creation.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {[
          ["fullName", "Full name"], ["email", "Email", "email"], ["mobile", "Mobile", "tel"],
          ["businessName", "Business name"], ["businessCategory", "Business category/work"], ["services", "Services"], ["location", "Location"],
          ["subscriptionStartDate", "Subscription start date", "date"], ["subscriptionEndDate", "Subscription end date", "date"]
        ].map(([key, label, type = "text"]) => <input key={key} name={key} type={type} required={["fullName", "email", "mobile"].includes(key)} className="field" placeholder={label} value={form[key]} onChange={({ currentTarget: { value } }) => setForm((current) => ({ ...current, [key]: key === "mobile" ? normalizePhone(value) : value }))} />)}
        <PasswordField name="password" required placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select required className="field" value={form.chapterId} onChange={(e) => setForm({ ...form, chapterId: e.target.value })}>
          <option value="">Assign chapter</option>
          {chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.chapterName}</option>)}
        </select>
        <select className="field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="USER">USER</option>
          <option value="SUPER_ADMIN">SUPER ADMIN</option>
        </select>
      </div>
      {chapters.length === 0 && <p className="mt-4 rounded-xl border border-red-500/30 bg-red-600/10 p-4 text-sm font-bold text-red-400">No chapters exist. Create an active chapter before creating a user.</p>}
      <button disabled={chapters.length === 0 || creating || created} className="btn-primary mt-5">{creating ? "Creating user..." : "Create User"}</button>
      {created && <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5"><p className="text-lg font-black text-emerald-400">User created successfully</p><p className="mt-1 text-sm text-slate-400">{created.user.fullName} · {created.user.email}</p><p className="mt-3 text-sm text-slate-400">The account is ready. Sending credentials is a separate action and can be retried if the mail server is unavailable.</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={sending} className="btn-primary" onClick={sendCredentials}>{sending ? "Sending credentials..." : "Send credentials"}</button><button type="button" className="btn-muted" onClick={createAnother}>Create another user</button></div></div>}
    </form><ManageUsers /></div>
  );
}

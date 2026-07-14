import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import { chapterApi } from "../../api/chapterApi";

const blank = { fullName: "", email: "", mobile: "", password: "", role: "USER", businessName: "", businessCategory: "", services: "", location: "", chapterId: "", subscriptionPlan: "", subscriptionStartDate: "", subscriptionEndDate: "", enabled: true };

export default function CreateUser() {
  const [chapters, setChapters] = useState([]);
  const [form, setForm] = useState(blank);
  useEffect(() => { chapterApi.all().then(setChapters).catch(() => setChapters([])); }, []);
  async function submit(e) {
    e.preventDefault();
    await adminApi.createUser({ ...form, chapterId: form.chapterId ? Number(form.chapterId) : null });
    toast.success("User created");
    setForm(blank);
  }
  return (
    <form onSubmit={submit} className="card p-6">
      <p className="page-kicker">Admin action</p>
      <h2 className="mt-1 page-title">Create <span className="text-[#E8262A]">User</span></h2>
      <p className="mt-1 text-sm text-slate-500">Create member/admin accounts. Public self-registration is disabled.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {[
          ["fullName", "Full name"], ["email", "Email"], ["mobile", "Mobile"], ["password", "Password"],
          ["businessName", "Business name"], ["businessCategory", "Business category/work"], ["services", "Services"], ["location", "Location"],
          ["subscriptionPlan", "Subscription plan"], ["subscriptionStartDate", "Subscription start date", "date"], ["subscriptionEndDate", "Subscription end date", "date"]
        ].map(([key, label, type = "text"]) => <input key={key} type={type} required={["fullName", "email", "password"].includes(key)} className="field" placeholder={label} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}
        <select className="field" value={form.chapterId} onChange={(e) => setForm({ ...form, chapterId: e.target.value })}>
          <option value="">Assign chapter</option>
          {chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.chapterName}</option>)}
        </select>
        <select className="field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
        </select>
      </div>
      <button className="btn-primary mt-5">Create User</button>
    </form>
  );
}

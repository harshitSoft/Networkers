import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { businessApi } from "../../api/businessApi";
import { normalizePhone, normalizeWebsite } from "../../utils/formValues.js";

const fields = ["businessName", "ownerName", "category", "description", "services", "lookingFor", "city", "state", "address", "website", "businessEmail", "businessPhone", "foundedYear", "teamSize", "logoUrl"];

export default function BusinessProfile() {
  const [form, setForm] = useState({});
  const [exists, setExists] = useState(false);
  useEffect(() => { businessApi.my().then((p) => { if (p) { setForm({ ...p, businessPhone: normalizePhone(p.businessPhone) }); setExists(true); } }); }, []);
  async function submit(e) {
    e.preventDefault();
    try {
      const payload = { ...form, website: normalizeWebsite(form.website) };
      const saved = exists ? await businessApi.update(payload) : await businessApi.create(payload);
      setForm(saved); setExists(true); toast.success("Business profile saved");
    } catch (error) { toast.error(error.response?.data?.message || "Save failed"); }
  }
  return (
    <form onSubmit={submit} className="card max-w-full space-y-4 p-4 sm:p-6">
      <h2 className="text-2xl font-black text-slate-950">My Business Profile</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <input key={field} name={field} type={field === "businessPhone" ? "tel" : "text"} inputMode={field === "website" ? "url" : undefined} data-accept-domain={field === "website" ? "true" : undefined} className="field" placeholder={field === "website" ? "www.example.com" : field} value={form[field] || ""} onChange={({ currentTarget: { value } }) => setForm((current) => ({ ...current, [field]: field === "businessPhone" ? normalizePhone(value) : field === "foundedYear" ? Number(value) : value }))} onBlur={field === "website" ? () => setForm((current) => ({ ...current, website: normalizeWebsite(current.website) })) : undefined} />
        ))}
      </div>
      <button className="btn-primary w-full sm:w-auto">Save profile</button>
    </form>
  );
}

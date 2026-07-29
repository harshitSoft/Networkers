import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { connectionApi } from "../../api/connectionApi";
import { referralApi } from "../../api/referralApi";
import EmptyState from "../../components/EmptyState.jsx";
import { normalizePhone } from "../../utils/formValues.js";

const directFields = [
  ["clientName", "Client name"],
  ["clientCompany", "Client company"],
  ["clientPhone", "Client phone"],
  ["clientEmail", "Client email optional"],
  ["workName", "Work name / requirement title"],
  ["productOrServiceRequired", "Product/service required"],
  ["estimatedBudget", "Estimated budget optional"],
  ["location", "Location optional"]
];

const openFields = [
  ["workName", "Work name / title"],
  ["companyName", "Company name"],
  ["productOrServiceRequired", "Product/service required"],
  ["budget", "Budget optional"],
  ["location", "Location optional"],
  ["posterUrl", "Poster/image URL optional"]
];

export default function CreateReferral() {
  const [type, setType] = useState("OPEN");
  const [network, setNetwork] = useState([]);
  const [form, setForm] = useState({});
  const currentUser = useMemo(() => JSON.parse(localStorage.getItem("networkers_user") || "null"), []);
  const navigate = useNavigate();

  useEffect(() => {
    connectionApi.network().then((data) => setNetwork(Array.isArray(data) ? data : [])).catch(() => setNetwork([]));
  }, []);

  const connectedUsers = network.map((c) => c.sender?.id === currentUser?.id ? c.receiver : c.sender).filter(Boolean);

  async function submit(e) {
    e.preventDefault();
    if (type === "OPEN") {
      await referralApi.open({ ...form, budget: numeric(form.budget) });
      toast.success("Open referral posted");
      navigate("/opportunities");
      return;
    }
    await referralApi.direct({ ...form, receivedById: Number(form.receivedById), estimatedBudget: numeric(form.estimatedBudget) });
    toast.success("Direct referral sent");
    navigate("/referrals/given");
  }

  return (
    <form onSubmit={submit} className="card max-w-full space-y-5 p-4 sm:p-6">
      <div>
        <h2 className="text-2xl font-black">Create Referral</h2>
        <p className="mt-1 text-sm text-slate-500">Post an open referral to your connected network or send a private client lead to one connection.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[["OPEN", "Open Referral Post"], ["DIRECT", "Direct Referral to Connection"]].map(([value, label]) => (
          <button type="button" key={value} onClick={() => { setType(value); setForm({}); }} className={`rounded-lg border p-4 text-left font-black transition ${type === value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
            {label}
          </button>
        ))}
      </div>

      {type === "DIRECT" && connectedUsers.length === 0 && (
        <EmptyState title="You need to connect with businesses before sending a direct referral." message="Go to New Connections, send a request, and create direct client leads after the connection is accepted." actionLabel="Find New Connections" actionTo="/businesses" />
      )}

      {type === "DIRECT" && connectedUsers.length > 0 && (
        <select required className="field" value={form.receivedById || ""} onChange={(e) => setForm({ ...form, receivedById: e.target.value })}>
          <option value="">Select connected person/business</option>
          {connectedUsers.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
        </select>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {(type === "OPEN" ? openFields : directFields).map(([field, label]) => (
          <input key={field} name={field} type={field === "clientPhone" ? "tel" : "text"} className="field" placeholder={label} value={form[field] || ""} onChange={({ currentTarget: { value } }) => setForm((current) => ({ ...current, [field]: field === "clientPhone" ? normalizePhone(value) : value }))} />
        ))}
      </div>

      <textarea required className="field min-h-32" placeholder="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />

      {type === "DIRECT" && (
        <textarea className="field min-h-24" placeholder="Notes optional" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      )}

      <button disabled={type === "DIRECT" && connectedUsers.length === 0} className="btn-primary w-full sm:w-auto">{type === "OPEN" ? "Post Open Referral" : "Send Direct Referral"}</button>
    </form>
  );
}

function numeric(value) {
  return value ? Number(value) : null;
}

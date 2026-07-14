import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import BusinessCard from "../../components/BusinessCard.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { businessApi } from "../../api/businessApi";
import { connectionApi } from "../../api/connectionApi";

export default function BusinessDirectory() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", city: "", category: "" });
  const load = () => businessApi.search(filters).then((data) => setItems(Array.isArray(data) ? data : [])).catch(() => {
    setItems([]);
    toast.error("Could not load businesses");
  });
  useEffect(() => { load(); }, []);
  async function connect(userId) {
    try { await connectionApi.send(userId); toast.success("Connection request sent"); } catch (e) { toast.error(e.response?.data?.message || "Could not send request"); }
  }
  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h2 className="text-2xl font-black text-slate-950">New Connections</h2>
        <p className="mt-1 text-sm text-slate-500">Find business owners and add the right people to your referral network.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {["keyword", "city", "category"].map((f) => <input key={f} className="field" placeholder={f} value={filters[f]} onChange={(e) => setFilters({ ...filters, [f]: e.target.value })} />)}
          <button className="btn-primary" onClick={load}>Search</button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((b) => <BusinessCard key={b.id} business={b} action={<button className="btn-primary" onClick={() => connect(b.user.id)}>Connect</button>} />)}
      </div>
      {items.length === 0 && <EmptyState title="No businesses found" message="Try a different city, category, or keyword. New member profiles will appear here as they join." actionLabel="Create Business Profile" actionTo="/business/profile" />}
    </div>
  );
}

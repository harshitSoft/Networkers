import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { CalendarDays, IndianRupee, MapPin, Send, UserRound } from "lucide-react";
import { referralApi } from "../../api/referralApi";
import EmptyState from "../../components/EmptyState.jsx";
import Loader from "../../components/Loader.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";

export default function BusinessOpportunities() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    referralApi.openNetwork()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function contact(id) {
    await referralApi.contactOpen(id);
    toast.success("Contact requested. Lead added to Client Leads Received.");
    load();
  }

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="page-kicker">Open referrals</p>
          <h2 className="mt-1 page-title">Business <span className="text-[#E8262A]">Opportunities</span></h2>
          <p className="text-sm text-slate-500">Open referrals posted by your connected network.</p>
        </div>
        <Link to="/referrals/create" className="btn-primary">Post Open Referral</Link>
      </div>

      <div className="grid gap-5">
        {items.map(({ post, contactRequested }) => (
          <GlowCard as="article" className="overflow-hidden" key={post.id}>
            {post.posterUrl && <img src={post.posterUrl} alt="" className="h-56 w-full object-cover" />}
            <div className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-red-700">Open Referral</p>
                  <h3 className="mt-1 text-2xl font-black text-slate-950">{post.workName}</h3>
                  <p className="mt-1 text-sm font-bold text-red-700">{post.productOrServiceRequired || "Product/service required"}</p>
                </div>
                <button disabled={contactRequested} onClick={() => contact(post.id)} className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-black transition ${contactRequested ? "bg-slate-100 text-slate-400" : "bg-[#E8262A] text-white hover:bg-[#B91C1C]"}`}>
                  <Send size={16} /> {contactRequested ? "Contact Requested" : "Get in Contact"}
                </button>
              </div>
              <p className="mt-4 leading-7 text-slate-600">{post.description}</p>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
                <Meta icon={<UserRound size={16} />} label="Company" value={post.companyName || "Company not specified"} />
                <Meta icon={<UserRound size={16} />} label="Posted by" value={post.postedBy?.fullName || "Network member"} />
                <Meta icon={<CalendarDays size={16} />} label="Date" value={post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recent"} />
                <Meta icon={<MapPin size={16} />} label="Location" value={post.location || "Not specified"} />
                <Meta icon={<IndianRupee size={16} />} label="Budget" value={post.budget ? `Rs ${Number(post.budget).toLocaleString("en-IN")}` : "Not specified"} />
              </div>
            </div>
          </GlowCard>
        ))}
      </div>

      {items.length === 0 && <EmptyState title="No open referrals from your network yet." message="When connected business owners post open referrals, they will appear here." actionLabel="Create Open Referral" actionTo="/referrals/create" />}
    </div>
  );
}

export function CreateOpportunity() {
  return (
    <EmptyState
      title="Create referrals from the referral page"
      message="Opportunities now come from open referral posts shared with your connected network."
      actionLabel="Create Referral"
      actionTo="/referrals/create"
    />
  );
}

function Meta({ icon, label, value }) {
  return <div className="rounded-2xl bg-slate-50 p-3"><p className="flex items-center gap-1 text-xs font-bold uppercase text-slate-400">{icon}{label}</p><p className="mt-1 font-bold text-slate-700">{value}</p></div>;
}

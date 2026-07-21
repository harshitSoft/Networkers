import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MapPin, UserRound } from "lucide-react";
import { businessApi } from "../../api/businessApi";
import { connectionApi } from "../../api/connectionApi";
import EmptyState from "../../components/EmptyState.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";

const tabs = [
  ["network", "My Network"],
  ["received", "Connection Requests"],
  ["sent", "Pending Requests"]
];

export default function MyNetwork() {
  const [active, setActive] = useState("network");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ network: [], received: [], sent: [], profiles: [] });
  const currentUser = useMemo(() => JSON.parse(localStorage.getItem("networkers_user") || "null"), []);

  const load = () => {
    setLoading(true);
    Promise.allSettled([connectionApi.network(), connectionApi.received(), connectionApi.sent(), businessApi.all()])
      .then(([network, received, sent, profiles]) => setData({
        network: okArray(network),
        received: okArray(received).filter((c) => c.status === "PENDING"),
        sent: okArray(sent).filter((c) => c.status === "PENDING"),
        profiles: okArray(profiles)
      }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function respond(id, action) {
    await connectionApi[action](id);
    toast.success(action === "accept" ? "Connection accepted" : "Connection rejected");
    load();
  }

  async function remove(id) {
    if (!window.confirm("Remove this connection from your network?")) return;
    await connectionApi.remove(id);
    toast.success("Connection removed");
    load();
  }

  async function cancel(id) {
    await connectionApi.cancel(id);
    toast.success("Request cancelled");
    load();
  }

  const profilesByUser = new Map(data.profiles.map((profile) => [profile.user?.id, profile]));
  const items = data[active];

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <p className="page-kicker">Connections</p>
        <h2 className="mt-1 page-title">My <span className="text-[#E8262A]">Network</span></h2>
        <p className="mt-1 text-sm text-slate-500">Manage accepted connections, incoming requests, and pending requests you sent.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map(([key, label]) => (
            <button key={key} onClick={() => setActive(key)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${active === key ? "bg-[#E8262A] text-white" : "border border-red-200 bg-white text-red-700 hover:bg-red-50"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((connection) => {
          const other = otherUser(connection, currentUser?.id);
          const profile = profilesByUser.get(other?.id);
          return (
            <NetworkCard
              key={connection.id}
              profile={profile}
              user={other}
              status={connection.status}
              footer={active === "network"
                ? <button className="btn-muted text-red-600 hover:bg-red-50" onClick={() => remove(connection.id)}>Remove Connection</button>
                : active === "received"
                  ? <div className="flex flex-wrap gap-2"><button className="btn-primary" onClick={() => respond(connection.id, "accept")}>Accept</button><button className="btn-muted" onClick={() => respond(connection.id, "reject")}>Reject</button></div>
                  : <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Pending</span><button className="btn-muted" onClick={() => cancel(connection.id)}>Cancel Request</button></div>}
            />
          );
        })}
      </div>

      {!loading && items.length === 0 && (
        <EmptyState
          title={active === "network" ? "No connected businesses yet" : active === "received" ? "No connection requests" : "No pending requests"}
          message={active === "network" ? "Find business owners and add them to your trusted network." : "Requests will appear here when there is activity."}
          actionLabel="Browse New Connections"
          actionTo="/businesses"
        />
      )}
    </div>
  );
}

function NetworkCard({ profile, user, status, footer }) {
  return (
    <GlowCard as="article">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-50 font-black text-red-700">
          {(profile?.businessName || user?.fullName || "N").split(" ").map((p) => p[0]).slice(0, 2).join("")}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-slate-400">Business Name</p>
          <h3 className="text-xl font-black text-slate-950">{profile?.businessName || "Business profile not created"}</h3>
          <p className="mt-2 text-sm font-bold text-red-700">Work: {profile?.category || "Business services"}</p>
        </div>
        {status && <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{status}</span>}
      </div>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <Info label="Services" value={profile?.services || "Services not added"} />
        <Info label="Location" value={profile?.city || "Location not added"} icon={<MapPin size={15} />} />
        <Info label="Owner" value={profile?.ownerName || user?.fullName || "Owner not listed"} icon={<UserRound size={15} />} />
        <Info label="Looking For" value={profile?.lookingFor || "Relevant business referrals"} />
      </dl>
      <div className="mt-5">{footer}</div>
    </GlowCard>
  );
}

function Info({ label, value, icon }) {
  return <div><dt className="text-xs font-bold uppercase text-slate-400">{label}</dt><dd className="mt-1 flex items-center gap-1 font-semibold text-slate-700">{icon}{value}</dd></div>;
}

function otherUser(connection, currentUserId) {
  return connection.sender?.id === currentUserId ? connection.receiver : connection.sender;
}

function okArray(result) {
  return result.status === "fulfilled" && Array.isArray(result.value) ? result.value : [];
}

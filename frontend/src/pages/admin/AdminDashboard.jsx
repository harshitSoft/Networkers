import { useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  Handshake,
  IndianRupee,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import StatCard from "../../components/StatCard.jsx";
import { adminApi } from "../../api/adminApi";
import { chapterApi } from "../../api/chapterApi";
import ManageUsers from "./ManageUsers.jsx";
import PasswordField from "../../components/PasswordField.jsx";
import { normalizePhone } from "../../utils/formValues.js";
const baseForm = {
  fullName: "",
  email: "",
  mobile: "",
  password: "",
  role: "USER",
  businessName: "",
  businessCategory: "",
  services: "",
  location: "",
  chapterId: "",
  subscriptionPlan: "",
  subscriptionStartDate: "",
  subscriptionEndDate: "",
  enabled: true,
  joinRequestId: null,
};
export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const load = () => {
    adminApi
      .dashboard()
      .then(setStats)
      .catch(() => setStats({}));
    adminApi
      .joinRequests()
      .then((d) => setRequests(Array.isArray(d) ? d : []))
      .catch(() => setRequests([]));
  };
  useEffect(() => {
    load();
  }, []);
  async function accept(r) {
    try {
      const accepted = await adminApi.acceptJoinRequest(r.id);
      setSelected(accepted);
      load();
      toast.success("Request accepted — complete the account details");
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not accept request");
    }
  }
  async function reject(r) {
    try {
      await adminApi.rejectJoinRequest(r.id);
      toast.success("Request rejected");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not reject request");
    }
  }
  return (
    <div className="page-shell">
      <div className="rounded-2xl bg-gradient-to-r from-[#8B0000] to-[#1A1A1A] p-6 text-white shadow-premium">
        <p className="page-kicker text-red-100">Admin workspace</p>
        <h2 className="mt-2 text-3xl font-black">
          Admin <span className="text-red-200">Dashboard</span>
        </h2>
        <p className="mt-2 text-white/75">
          Review membership requests and manage the Networkers ecosystem.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Network Revenue" value={`Rs ${Number(stats.totalBusinessGenerated || 0).toLocaleString("en-IN")}`} icon={IndianRupee} />
        <StatCard label="Confirmed Referrals" value={stats.convertedReferrals || 0} icon={Handshake} />
        <StatCard label="Total Members" value={stats.totalUsers || 0} icon={Users} />
        <StatCard label="Total Chapters" value={stats.totalChapters || 0} icon={Building2} />
        <StatCard label="All Referrals" value={stats.totalReferrals || 0} icon={Handshake} />
        <StatCard label="Upcoming Meetups" value={stats.upcomingMeetups || 0} icon={CalendarDays} />
        <StatCard
          label="Join Requests"
          value={stats.pendingJoinRequests || 0}
          icon={UserPlus}
        />
      </div>
      <section className="glass-card rounded-3xl p-6">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="page-kicker">Network performance</p><h3 className="mt-1 text-2xl font-black">Revenue conversion overview</h3><p className="mt-2 text-sm text-brand-muted">Revenue and successfully completed referrals across the platform.</p></div><strong className="text-3xl text-red-500">Rs {Number(stats.totalBusinessGenerated || 0).toLocaleString("en-IN")}</strong></div>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-red-900 to-red-500 transition-all duration-700" style={{width:`${stats.totalReferrals ? Math.max(2, (stats.convertedReferrals || 0) / stats.totalReferrals * 100) : 0}%`}} /></div>
        <div className="mt-2 flex justify-between text-xs text-brand-muted"><span>{stats.convertedReferrals || 0} confirmed</span><span>{stats.totalReferrals || 0} total referrals</span></div>
      </section>
      <section className="card overflow-hidden">
        <div className="border-b border-red-500/20 p-5">
          <p className="page-kicker">Membership queue</p>
          <h3 className="mt-1 text-2xl font-black">
            Account creation requests
          </h3>
        </div>
        {requests.length === 0 ? (
          <p className="p-8 text-center text-slate-500">
            No membership requests yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[850px] w-full text-left text-sm">
              <thead className="bg-black/20 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  {[
                    "Applicant",
                    "Contact",
                    "Business",
                    "Message",
                    "Status",
                    "Actions",
                  ].map((x) => (
                    <th className="p-4" key={x}>
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-t border-white/10 align-top">
                    <td className="p-4">
                      <strong>{r.fullName}</strong>
                      <p className="mt-1 text-xs text-slate-500">
                        {r.location || "—"}
                      </p>
                    </td>
                    <td className="p-4">
                      {r.email}
                      <p className="mt-1 text-xs text-slate-500">{r.mobile}</p>
                    </td>
                    <td className="p-4">
                      {r.businessName || "—"}
                      <p className="mt-1 text-xs text-slate-500">
                        {r.businessCategory || ""}
                      </p>
                    </td>
                    <td className="max-w-xs p-4 text-slate-400">
                      {r.message || "—"}
                    </td>
                    <td className="p-4">
                      <span className="status-pill">
                        {r.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {r.status === "PENDING" && (
                          <>
                            <button
                              className="btn-primary !px-4 !py-2"
                              onClick={() => accept(r)}
                            >
                              Accept
                            </button>
                            <button
                              className="btn-muted !px-4 !py-2"
                              onClick={() => reject(r)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {r.status === "ACCEPTED" && (
                          <button
                            className="btn-primary !px-4 !py-2"
                            onClick={() => setSelected(r)}
                          >
                            Create account
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <ManageUsers />
      {selected && (
        <AccountModal
          request={selected}
          onClose={() => setSelected(null)}
          onCreated={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
}
function AccountModal({ request, onClose, onCreated }) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [created, setCreated] = useState(null);
  const [form, setForm] = useState({
    ...baseForm,
    fullName: request.fullName,
    email: request.email,
    mobile: normalizePhone(request.mobile || ""),
    businessName: request.businessName || "",
    businessCategory: request.businessCategory || "",
    location: request.location || "",
    joinRequestId: request.id,
  });
  useEffect(() => {
    chapterApi
      .all()
      .then(setChapters)
      .catch(() => setChapters([]));
  }, []);
  async function submit(e) {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.mobile))
      return toast.error("Enter a valid 10-digit mobile number");
    setLoading(true);
    try {
      const user = await adminApi.createUser({
        ...form,
        chapterId: form.chapterId ? Number(form.chapterId) : null,
      });
      setCreated({ user, password: form.password });
      toast.success("User created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  }
  async function sendCredentials() {
    setSending(true);
    try {
      await adminApi.sendCredentials(created.user.id, created.password);
      toast.success(`Credentials sent to ${created.user.email}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not send credentials. You can retry.",
      );
    } finally {
      setSending(false);
    }
  }
  function finish() {
    onCreated();
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="card my-6 w-full max-w-4xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="page-kicker">Approved request</p>
            <h2 className="mt-1 text-3xl font-black">Create user account</h2>
            <p className="mt-2 text-sm text-slate-400">
              Create the account first. Send login credentials separately after
              creation.
            </p>
          </div>
          <button
            type="button"
            onClick={created ? finish : onClose}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10"
          >
            <X />
          </button>
        </div>
        {!created && (
          <>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {[
                ["fullName", "Full name", "text"],
                ["email", "Email", "email"],
                ["mobile", "Mobile", "tel"],
                ["businessName", "Business name", "text"],
                ["businessCategory", "Business category", "text"],
                ["services", "Services", "text"],
                ["location", "Location", "text"],
                ["subscriptionPlan", "Subscription plan", "text"],
                ["subscriptionStartDate", "Start date", "date"],
                ["subscriptionEndDate", "End date", "date"],
              ].map(([key, label, type]) => (
                <label key={key}>
                  <span className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    {label}
                  </span>
                  <input
                    name={key}
                    className="field"
                    required={["fullName", "email", "mobile"].includes(key)}
                    type={type}
                    value={form[key]}
                    onChange={({ currentTarget: { value } }) =>
                      setForm((current) => ({
                        ...current,
                        [key]: key === "mobile" ? normalizePhone(value) : value,
                      }))
                    }
                  />
                </label>
              ))}
              <label>
                <span className="mb-1 block text-xs font-bold uppercase text-slate-500">
                  Temporary password
                </span>
                <PasswordField
                  name="password"
                  required
                  value={form.password}
                  onChange={({ currentTarget: { value } }) =>
                    setForm((current) => ({ ...current, password: value }))
                  }
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold uppercase text-slate-500">
                  Chapter
                </span>
                <select
                  required
                  className="field"
                  value={form.chapterId}
                  onChange={({ currentTarget: { value } }) =>
                    setForm((current) => ({ ...current, chapterId: value }))
                  }
                >
                  <option value="">Assign chapter</option>
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.chapterName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold uppercase text-slate-500">
                  Role
                </span>
                <select
                  className="field"
                  value={form.role}
                  onChange={({ currentTarget: { value } }) =>
                    setForm((current) => ({ ...current, role: value }))
                  }
                >
                  <option value="USER">USER</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN</option>
                </select>
              </label>
            </div>
            <button disabled={loading} className="btn-primary mt-6">
              {loading && <span className="spinner" />}
              {loading ? "Creating user..." : "Create user"}
            </button>
          </>
        )}
        {created && (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <p className="text-xl font-black text-emerald-400">
              Account created successfully
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {created.user.fullName} · {created.user.email}
            </p>
            <p className="mt-3 text-sm text-slate-400">
              The account is active even if email delivery fails. Send
              credentials now or retry later from this screen.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={sending}
                className="btn-primary"
                onClick={sendCredentials}
              >
                {sending ? "Sending credentials..." : "Send credentials"}
              </button>
              <button type="button" className="btn-muted" onClick={finish}>
                Done
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

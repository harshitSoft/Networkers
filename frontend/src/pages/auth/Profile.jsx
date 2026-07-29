import {
  Briefcase,
  KeyRound,
  Save,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { authApi } from "../../api/authApi";
import { businessApi } from "../../api/businessApi";
import PasswordField from "../../components/PasswordField.jsx";
const emptyBusiness = {
  businessName: "",
  ownerName: "",
  category: "",
  description: "",
  services: "",
  lookingFor: "",
  city: "",
  state: "",
  address: "",
  website: "",
  businessEmail: "",
  businessPhone: "",
  foundedYear: "",
  teamSize: "",
  logoUrl: "",
};
export default function Profile() {
  const { user, updateCurrentUser } = useAuth();
  const [tab, setTab] = useState("personal");
  const [personal, setPersonal] = useState({
    fullName: user.fullName || "",
    mobile: user.mobile || "",
    location: user.location || "",
  });
  const [password, setPassword] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordOtpSent, setPasswordOtpSent] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [business, setBusiness] = useState(emptyBusiness);
  const [hasBusiness, setHasBusiness] = useState(false);
  useEffect(() => {
    businessApi
      .my()
      .then((data) => {
        if (data) {
          setHasBusiness(true);
          setBusiness({
            ...emptyBusiness,
            ...data,
            foundedYear: data.foundedYear || "",
          });
        }
      })
      .catch(() => {});
  }, []);
  async function savePersonal(e) {
    e.preventDefault();
    try {
      const updated = await authApi.updateProfile(personal);
      updateCurrentUser(updated);
      toast.success("Personal profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update profile");
    }
  }
  async function requestPasswordOtp() {
    setPasswordBusy(true);
    try {
      await authApi.requestPasswordChangeOtp();
      setPasswordOtpSent(true);
      toast.success(`OTP sent to ${user.email}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send OTP");
    } finally {
      setPasswordBusy(false);
    }
  }
  async function savePassword(e) {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword)
      return toast.error("New passwords do not match");
    setPasswordBusy(true);
    try {
      await authApi.confirmPasswordChange({
        otp: password.otp,
        newPassword: password.newPassword,
      });
      setPassword({ otp: "", newPassword: "", confirmPassword: "" });
      setPasswordOtpSent(false);
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not change password");
    } finally {
      setPasswordBusy(false);
    }
  }
  async function saveBusiness(e) {
    e.preventDefault();
    try {
      const payload = {
        ...business,
        foundedYear: business.foundedYear ? Number(business.foundedYear) : null,
      };
      const saved = hasBusiness
        ? await businessApi.update(payload)
        : await businessApi.create(payload);
      setBusiness({
        ...emptyBusiness,
        ...saved,
        foundedYear: saved.foundedYear || "",
      });
      setHasBusiness(true);
      toast.success("Business profile saved");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not save business profile",
      );
    }
  }
  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-gradient-to-r from-[#8B0000] to-[#1A1A1A] p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-white/10">
            <UserCircle size={38} />
          </div>
          <div>
            <h2 className="text-3xl font-black">{user.fullName}</h2>
            <p className="mt-1 text-red-100">
              {user.role} ·{" "}
              {user.enabled ? "Active account" : "Inactive account"}
            </p>
          </div>
        </div>
      </section>
      <div className="flex w-fit max-w-full gap-2 overflow-x-auto rounded-full bg-[#111] p-1.5">
        {[
          ["personal", "Personal profile", UserCircle],
          ["business", "Business profile", Briefcase],
          ["security", "Password & security", KeyRound],
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${tab === key ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>
      {tab === "personal" && (
        <ProfileForm
          title="Personal information"
          copy="Update your name, contact number, and location."
          onSubmit={savePersonal}
        >
          {[
            ["fullName", "Full name", "text"],
            ["mobile", "Contact number", "tel"],
            ["location", "Location", "text"],
          ].map(([key, label, type]) => (
            <Field
              key={key}
              label={label}
              type={type}
              value={personal[key]}
              onChange={(v) => setPersonal({ ...personal, [key]: v })}
            />
          ))}
          <Field label="Login email" value={user.email} disabled />
          <button className="btn-primary mt-2">
            <Save size={17} />
            Save personal profile
          </button>
        </ProfileForm>
      )}
      {tab === "security" && (
        <ProfileForm
          title="Change password"
          copy={`Verify the change with a one-time password sent to ${user.email}.`}
          onSubmit={savePassword}
        >
          {!passwordOtpSent ? (
            <button
              type="button"
              disabled={passwordBusy}
              onClick={requestPasswordOtp}
              className="btn-primary mt-2 sm:col-span-2"
            >
              <KeyRound size={17} />
              {passwordBusy ? "Sending OTP..." : "Send email OTP"}
            </button>
          ) : (
            <>
              <Field
                label="Email OTP"
                required
                value={password.otp}
                onChange={(v) =>
                  setPassword({
                    ...password,
                    otp: v.replace(/\D/g, "").slice(0, 6),
                  })
                }
              />
              <Field
                label="New password"
                required
                type="password"
                minLength={8}
                value={password.newPassword}
                onChange={(v) => setPassword({ ...password, newPassword: v })}
              />
              <Field
                label="Confirm new password"
                required
                type="password"
                minLength={8}
                value={password.confirmPassword}
                onChange={(v) =>
                  setPassword({ ...password, confirmPassword: v })
                }
              />
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button disabled={passwordBusy} className="btn-primary">
                  <KeyRound size={17} />
                  {passwordBusy
                    ? "Changing..."
                    : "Verify OTP & change password"}
                </button>
                <button
                  type="button"
                  className="btn-muted"
                  onClick={requestPasswordOtp}
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}
        </ProfileForm>
      )}
      {tab === "business" && (
        <ProfileForm
          title="Business profile"
          copy="Manage the business information visible to other members."
          onSubmit={saveBusiness}
          wide
        >
          {[
            ["businessName", "Business name", "text"],
            ["ownerName", "Owner name", "text"],
            ["category", "Category", "text"],
            ["businessEmail", "Business email", "email"],
            ["businessPhone", "Business phone", "tel"],
            ["website", "Website", "url"],
            ["city", "City", "text"],
            ["state", "State", "text"],
            ["address", "Address", "text"],
            ["foundedYear", "Founded year", "number"],
            ["teamSize", "Team size", "text"],
            ["logoUrl", "Logo URL", "url"],
            ["services", "Services", "text"],
            ["lookingFor", "Looking for", "text"],
            ["description", "Description", "text"],
          ].map(([key, label, type]) => (
            <Field
              key={key}
              label={label}
              required={key === "businessName"}
              type={type}
              value={business[key] ?? ""}
              onChange={(v) => setBusiness({ ...business, [key]: v })}
            />
          ))}
          <button className="btn-primary mt-2 md:col-span-2">
            <Save size={17} />
            {hasBusiness ? "Update" : "Create"} business profile
          </button>
        </ProfileForm>
      )}
    </div>
  );
}
function ProfileForm({ title, copy, onSubmit, children, wide = false }) {
  return (
    <form onSubmit={onSubmit} className={`card p-6 ${wide ? "" : "max-w-3xl"}`}>
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{copy}</p>
      {title === "Personal information" && <ProfileImageAndSubscription />}
      <div
        className={`mt-6 grid gap-4 ${wide ? "md:grid-cols-2" : "sm:grid-cols-2"}`}
      >
        {children}
      </div>
    </form>
  );
}
function ProfileImageAndSubscription() {
  const { user, updateCurrentUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const days = user.subscriptionEndDate
    ? Math.ceil((new Date(user.subscriptionEndDate) - new Date()) / 86400000)
    : null;
  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const updated = await authApi.uploadProfileImage(file);
      updateCurrentUser(updated);
      toast.success("Profile image updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not upload image");
    } finally {
      setUploading(false);
    }
  }
  return (
    <div className="mt-6 grid gap-4 border-y border-white/10 py-5 sm:grid-cols-[auto_1fr]">
      <label className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-red-500/60 bg-black/20">
        <input
          className="sr-only"
          type="file"
          accept="image/*"
          onChange={upload}
        />
        {user.profileImage ? (
          <img
            className="h-full w-full object-cover"
            src={user.profileImage}
            alt="Profile"
          />
        ) : (
          <span className="grid h-full place-items-center px-2 text-center text-xs text-red-400">
            Upload image
          </span>
        )}
      </label>
      <div>
        <p className="font-bold">
          {uploading ? "Uploading image..." : "Profile photograph"}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          All browser-supported image formats, maximum 10 MB.
        </p>
        <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
          <span>
            Start: <strong>{user.subscriptionStartDate || "Not set"}</strong>
          </span>
          <span>
            End: <strong>{user.subscriptionEndDate || "Not set"}</strong>
          </span>
          <span>
            Next renewal:{" "}
            <strong>{user.subscriptionEndDate || "Not set"}</strong>
          </span>
        </div>
        {days !== null && days <= 7 && days >= 0 && (
          <p className="mt-3 rounded-lg bg-red-600/15 p-3 text-sm font-bold text-red-400">
            Subscription renewal is due in {days} day{days === 1 ? "" : "s"}. A
            reminder will also be sent by email.
          </p>
        )}
      </div>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  required = false,
  minLength,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      {type === "password" ? <PasswordField value={value} disabled={disabled} required={required} minLength={minLength} onChange={(e) => onChange?.(e.target.value)} /> : <input className="field" type={type} value={value} disabled={disabled} required={required} minLength={minLength} onChange={(e) => onChange?.(e.target.value)} />}
    </label>
  );
}

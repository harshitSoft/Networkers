import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Network,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PasswordField from "../../components/PasswordField.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { authApi } from "../../api/authApi.js";
import Loader from "../../components/Loader.jsx";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState("email");
  const [reset, setReset] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetting, setResetting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    try {
      const user = await login(form);
      navigate(
        user.role === "SUPER_ADMIN" || user.role === "ADMIN"
          ? "/admin"
          : "/community",
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  }
  async function requestOtp(e) {
    e.preventDefault();
    setResetting(true);
    try {
      await authApi.requestForgotPasswordOtp(reset.email);
      setForgotStep("otp");
      toast.success("If this email is registered, an OTP has been sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send OTP");
    } finally {
      setResetting(false);
    }
  }
  async function resetPassword(e) {
    e.preventDefault();
    if (reset.newPassword !== reset.confirmPassword)
      return toast.error("Passwords do not match");
    setResetting(true);
    try {
      await authApi.resetForgottenPassword({
        email: reset.email,
        otp: reset.otp,
        newPassword: reset.newPassword,
      });
      setForm({ email: reset.email, password: "" });
      closeForgot();
      toast.success("Password reset successfully. You can now sign in.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not reset password");
    } finally {
      setResetting(false);
    }
  }
  function closeForgot() {
    setForgotOpen(false);
    setForgotStep("email");
    setReset({ email: "", otp: "", newPassword: "", confirmPassword: "" });
  }

  if (loading) return <Loader fullScreen label="Opening your dashboard" />;
  return (
    <AuthFrame>
      <form onSubmit={submit} autoComplete="off" className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#b3b3b3]">
            Email address
          </span>
          <span className="relative block">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
              size={18}
            />
            <input
              required
              aria-label="Email address"
              className="field !pl-12"
              type="email"
              autoComplete="username"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </span>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#b3b3b3]">
            Password
          </span>
          <span className="relative block">
            <LockKeyhole
              className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
              size={18}
            />
            <input
              required
              aria-label="Password"
              className="field !px-12"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-[#888] hover:text-red-400"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-[#b3b3b3]">
            <input type="checkbox" className="accent-red-600" /> Remember me
          </label>
          <button
            type="button"
            onClick={() => {
              setReset((r) => ({ ...r, email: form.email }));
              setForgotOpen(true);
            }}
            className="text-red-400 hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <button
          disabled={loading}
          className="glow-button glow-button-primary w-full"
        >
          {loading && <span className="spinner" />}
          {loading ? "Logging in..." : "Enter your network"}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-[#888]">
        Membership is verified by an admin.{" "}
        <Link
          to="/chapters"
          className="font-semibold text-red-400 hover:underline"
        >
          Explore chapters
        </Link>
      </p>
      {forgotOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-brand-panel p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">Reset password</h2>
                <p className="mt-1 text-sm text-brand-muted">
                  {forgotStep === "email"
                    ? "Enter your registered email to receive a one-time password."
                    : "Enter the six-digit OTP sent to your email."}
                </p>
              </div>
              <button
                type="button"
                className="glass-icon"
                onClick={closeForgot}
              >
                <X size={18} />
              </button>
            </div>
            {forgotStep === "email" ? (
              <form className="mt-6 space-y-4" onSubmit={requestOtp}>
                <input
                  autoFocus
                  required
                  className="field"
                  type="email"
                  placeholder="Registered email"
                  value={reset.email}
                  onChange={(e) =>
                    setReset({ ...reset, email: e.target.value })
                  }
                />
                <button
                  disabled={resetting}
                  className="btn-primary w-full justify-center"
                >
                  {resetting ? "Sending..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={resetPassword}>
                <input
                  autoFocus
                  required
                  className="field text-center tracking-[.35em]"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength="6"
                  placeholder="6-digit OTP"
                  value={reset.otp}
                  onChange={(e) =>
                    setReset({
                      ...reset,
                      otp: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
                <PasswordField
                  required
                  minLength="8"
                  placeholder="New password"
                  value={reset.newPassword}
                  onChange={(e) =>
                    setReset({ ...reset, newPassword: e.target.value })
                  }
                />
                <PasswordField
                  required
                  minLength="8"
                  placeholder="Confirm new password"
                  value={reset.confirmPassword}
                  onChange={(e) =>
                    setReset({ ...reset, confirmPassword: e.target.value })
                  }
                />
                <button
                  disabled={resetting}
                  className="btn-primary w-full justify-center"
                >
                  {resetting ? "Resetting..." : "Reset password"}
                </button>
                <button
                  type="button"
                  className="btn-muted w-full justify-center"
                  onClick={() => setForgotStep("email")}
                >
                  Use another email
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </AuthFrame>
  );
}

export function AuthFrame({ children }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-20">
      <Link
        to="/"
        className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-brand-panel/80 px-4 py-2 text-sm font-bold text-brand-primary backdrop-blur transition hover:border-red-500 hover:text-red-500"
      >
        <ArrowLeft size={17} />
        Back to home
      </Link>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(139,0,0,.08),transparent_48%)] transition-opacity duration-500" />
      <div className="auth-card glass-card relative z-10 w-full max-w-[440px] rounded-3xl p-7 sm:p-9">
        <Link
          to="/"
          className="mx-auto flex w-fit items-center gap-2 text-xl font-bold"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-600 shadow-[0_0_25px_rgba(225,6,0,.4)]">
            <Network />
          </span>
          Network<span className="-ml-2 text-red-500">ers</span>
        </Link>
        <p className="mt-3 text-center text-xs uppercase tracking-[.16em] text-[#888]">
          Connect · Refer · Grow
        </p>
        <h1 className="mt-8 text-center text-3xl font-bold">
          Sign in to your network
        </h1>
        <p className="mt-2 text-center text-sm text-[#888]">
          Welcome back. Your next opportunity is waiting.
        </p>
        {children}
      </div>
    </main>
  );
}

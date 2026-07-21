import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("networkers_user") || "null"));
  const [loading, setLoading] = useState(false);
  const [operation,setOperation]=useState(null);

  useEffect(() => {
    if (!localStorage.getItem("networkers_token")) return;
    authApi.me().then(setUser).catch(() => logout());
  }, []);

  async function login(payload) {
    setOperation("login");
    setLoading(true);
    try {
      const data = await authApi.login({ ...payload, email: payload.email.trim().toLowerCase() });
      localStorage.setItem("networkers_token", data.token);
      localStorage.setItem("networkers_user", JSON.stringify(data.user));
      setUser(data.user);
      toast.success("Welcome back");
      return data.user;
    } finally {
      setLoading(false);
      setOperation(null);
    }
  }

  async function register(payload) {
    setLoading(true);
    try {
      const data = await authApi.register(payload);
      localStorage.setItem("networkers_token", data.token);
      localStorage.setItem("networkers_user", JSON.stringify(data.user));
      setUser(data.user);
      toast.success("Account created");
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setOperation("logout");setLoading(true);
    await new Promise(resolve=>setTimeout(resolve,700));
    localStorage.removeItem("networkers_token");
    localStorage.removeItem("networkers_user");
    setUser(null);
    setLoading(false);setOperation(null);
  }

  function updateCurrentUser(nextUser) {
    localStorage.setItem("networkers_user", JSON.stringify(nextUser));
    setUser(nextUser);
  }

  const value = useMemo(() => ({ user, loading, operation, login, register, logout, updateCurrentUser, isAdmin: user?.role === "SUPER_ADMIN" || user?.role === "ADMIN" }), [user, loading, operation]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

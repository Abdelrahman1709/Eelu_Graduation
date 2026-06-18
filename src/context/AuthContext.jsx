import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { normalizeUserData } from "../utils/authUtils";
import { apiCall } from "../utils/apiClient";
import { getCurrentUser } from "../services/userService";

const API_BASE = "https://itlala.up.railway.app/api";
const defaultAuthContext = {
  user: null,
  token: null,
  loading: false,
  login: () => {},
  loginWithGoogle: async () => {},
  logout: () => {},
};

const AuthContext = createContext(defaultAuthContext);
const TOKEN_EXPIRY_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [expiryTime, setExpiryTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastActivityRefresh = useRef(Date.now());
  let queryClient = null;
  try {
    queryClient = useQueryClient();
  } catch (e) {
    queryClient = null;
  }

  // Check if token is expired
  const isTokenExpired = (expiryTime) => {
    return Date.now() > expiryTime;
  };

  const refreshTokenExpiry = () => {
    const newExpiry = Date.now() + TOKEN_EXPIRY_DURATION;
    localStorage.setItem("tokenExpiry", newExpiry.toString());
    setExpiryTime(newExpiry);
    return newExpiry;
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const tokenExpiry = localStorage.getItem("tokenExpiry");

      if (!storedToken || !tokenExpiry || isTokenExpired(parseInt(tokenExpiry))) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("tokenExpiry");
        setToken(null);
        setUser(null);
        setExpiryTime(null);
        setLoading(false);
        return;
      }

      setToken(storedToken);
      setExpiryTime(parseInt(tokenExpiry));

      if (storedUser) {
        try {
          setUser(normalizeUserData(JSON.parse(storedUser)));
        } catch (error) {
          localStorage.removeItem("user");
        }
      }

      try {
        const serverUser = await getCurrentUser();
        const normalized = normalizeUserData(serverUser);

        if (typeof normalized.photo === "string" && normalized.photo.startsWith("data:")) {
          const previousUser = storedUser ? normalizeUserData(JSON.parse(storedUser)) : null;
          normalized.photo = previousUser?.photo || null;
        }

        setUser(normalized);
        localStorage.setItem("user", JSON.stringify(normalized));
        if (queryClient) {
          const userKey = ["user-profile", normalized?.email || normalized?.id || normalized?._id || "current"];
          queryClient.setQueryData(userKey, normalized);
          queryClient.setQueryData(["user-profile"], normalized);
        }
      } catch (err) {
        console.warn("Failed to refresh current user:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  function login(userData, accessToken = null) {
    const newExpiryTime = Date.now() + TOKEN_EXPIRY_DURATION;
    const normalizedUser = normalizeUserData(userData);

    if (typeof normalizedUser.photo === "string" && normalizedUser.photo.startsWith("data:")) {
      delete normalizedUser.photo;
    }

    setUser(normalizedUser);
    setExpiryTime(newExpiryTime);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    localStorage.setItem("tokenExpiry", newExpiryTime.toString());

    if (accessToken) {
      setToken(accessToken);
      localStorage.setItem("token", accessToken);
    } else {
      const storedToken = localStorage.getItem("token");
      if (storedToken) setToken(storedToken);
    }

    if (queryClient) {
      const userKey = ["user-profile", normalizedUser?.email || normalizedUser?.id || normalizedUser?._id || "current"];
      queryClient.setQueryData(userKey, normalizedUser);
      queryClient.setQueryData(["user-profile"], normalizedUser);
      queryClient.invalidateQueries({ queryKey: userKey });
    }
  }

  async function loginWithGoogle({ idToken, name, email, photo }) {
    try {
      const response = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: idToken, name, email, photo }),
      });

      const text = await response.text().catch(() => "");
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { raw: text };
      }

      if (!response.ok) {
        const errorMsg = (data && (data.message || data.error)) || `Google login failed (${response.status})`;
        throw new Error(errorMsg);
      }

      const accessToken = (data && (data.accessToken || data.token)) || idToken;
      const backendUser = (data && (data.user || data.data || null)) || { name, email, photo, gender: null };
      const userData = {
        ...backendUser,
        isGoogleAccount: true,
        authProvider: "google",
      };

      // Persist and update local state
      login(userData, accessToken);

      // Return full backend payload to help callers verify structure
      return { user: userData, accessToken, backendPayload: data };
    } catch (error) {
      console.error("Google login error:", error.message || error);
      throw error;
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    if (queryClient) {
      queryClient.removeQueries({ queryKey: ["user-profile"] });
    }
  }

  // Monitor token expiry and auto-logout
  useEffect(() => {
    if (!token || !expiryTime) return;

    if (isTokenExpired(expiryTime)) {
      logout();
      window.dispatchEvent(new CustomEvent("session-expired"));
      return;
    }

    const timeUntilExpiry = expiryTime - Date.now();

    const timer = setTimeout(() => {
      logout();
      window.dispatchEvent(new CustomEvent("session-expired"));
    }, timeUntilExpiry);

    return () => clearTimeout(timer);
  }, [token, expiryTime]);

  useEffect(() => {
    if (!token || !expiryTime) return;

    const refreshOnActivity = () => {
      const now = Date.now();
      if (now - lastActivityRefresh.current < 30_000) return;
      if (isTokenExpired(expiryTime)) return;
      refreshTokenExpiry();
      lastActivityRefresh.current = now;
    };

    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    events.forEach((event) => window.addEventListener(event, refreshOnActivity, { passive: true }));

    return () => events.forEach((event) => window.removeEventListener(event, refreshOnActivity));
  }, [token, expiryTime]);

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    console.error("useAuth must be used within an AuthProvider");
  }

  return context || defaultAuthContext;
}

export { AuthProvider, useAuth };
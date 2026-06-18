import toast from "react-hot-toast";

const API_BASE = "https://itlala.up.railway.app/api";

/**
 * Centralized API client with automatic 401 handling
 * If token is invalid/expired, automatically logs out and redirects to login
 */
export async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - Session expired or invalid token
    if (response.status === 401) {
      handleSessionExpired();
      throw new Error("Unauthorized - Session expired");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Better classification for network-level failures
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      const networkError = new Error(
        "Network error: failed to reach the API server. Check your internet connection and verify that https://itlala.up.railway.app is available."
      );
      console.error("API Network Error:", error);
      throw networkError;
    }

    if (error.message !== "Unauthorized - Session expired") {
      console.error("API Error:", error);
    }
    throw error;
  }
}

/**
 * Handle session expiration (401 error)
 */
function handleSessionExpired() {
  // Clear auth data
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("tokenExpiry");

  // Show notification
  toast.error("Your session has expired. Please log in again.", {
    duration: 3000,
  });

  // Redirect to login after a toast message
  setTimeout(() => {
    window.location.href = "/login";
  }, 500);
}

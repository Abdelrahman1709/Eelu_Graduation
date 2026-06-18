import { apiCall } from "../utils/apiClient";
import { normalizeUserData } from "../utils/authUtils";

export const updateProfilePhoto = async (imageBase64) => {
  const result = await apiCall("/auth/profile-photo", {
    method: "PUT",
    body: JSON.stringify({ imageBase64 }),
  });

  if (result && result.success === false) {
    throw new Error(result.message || "Failed to update profile photo");
  }

 
  if (result.photo) {
    return { photo: result.photo };
  }

  throw new Error("Invalid response: Photo URL not found");
};

export const getCurrentUser = async () => {
  const result = await apiCall("/auth/me", { method: "GET" });
  if (!result) throw new Error("Failed to fetch current user");
  return normalizeUserData(result?.user || result?.data || result);
};
export const updateName = async (name) => {
  const result = await apiCall("/auth/update-name", {
    method: "PUT",
    body: JSON.stringify({ name }),
  });

  if (!result.success) {
    throw new Error(result.message || "Failed to update name");
  }

  return result.user || result;
};

export const trackModelUsage = async (type) => {
  if (!type) {
    throw new Error("Model usage type is required");
  }

  const result = await apiCall("/stats/model-usage", {
    method: "POST",
    body: JSON.stringify({ model: type }),
  });

  if (!result.success) {
    throw new Error(result.message || "Failed to track model usage");
  }

  return result;
};

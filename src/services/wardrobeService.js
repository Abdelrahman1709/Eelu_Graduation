import { apiCall } from "../utils/apiClient";

// Add item to wardrobe
export const addToWardrobe = async (itemId) => {
  const result = await apiCall("/wardrobe", {
    method: "POST",
    body: JSON.stringify({ itemId }),
  });

  if (!result.success) {
    throw new Error(result.message || "Failed to add item to wardrobe");
  }

  return result;
};

// Get user wardrobe
export const getWardrobe = async () => {
  const result = await apiCall("/wardrobe", {
    method: "GET",
  });

  return result.data || result || [];
};

// Remove item from wardrobe
export const removeFromWardrobe = async (itemId) => {
  const result = await apiCall(`/wardrobe/${itemId}`, {
    method: "DELETE",
  });

  if (!result.success) {
    throw new Error(result.message || "Failed to remove item from wardrobe");
  }

  return result;
};


// Create a custom wardrobe item (with base64 image)
export const createCustomItem = async (itemData) => {
  const result = await apiCall("/wardrobe/custom", {
    method: "POST",
    body: JSON.stringify(itemData),
  });

  if (!result.success) {
    throw new Error(result.message || "Failed to create custom item");
  }

  return result.item || result;
};
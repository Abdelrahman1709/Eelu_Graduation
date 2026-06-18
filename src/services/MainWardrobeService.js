const API_BASE_URL = "https://itlala.up.railway.app/api";

export const getMainWardrobe = async (gender) => {
  const response = await fetch(
    `${API_BASE_URL}/items?gender=${gender}&limit=10000`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch wardrobe items");
  }

  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;

  return [];
};

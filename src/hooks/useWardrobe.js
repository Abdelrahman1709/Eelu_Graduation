import { useState, useEffect } from "react";

// helper used by the hook and by route loaders when we need a full inventory
export function generateMockItems(count = 100) {
  const categories = ["men", "women", "unisex"];
  const seasons = ["summer", "winter", "all"];
  const types = ["outerwear", "dresses", "shoes", "accessories"];

  const mock = [];
  for (let i = 1; i <= count; i++) {
    mock.push({
      id: i,
      name: `Item ${i}`,
      category: categories[i % categories.length],
      season: seasons[i % seasons.length],
      type: types[i % types.length],
      image: `https://via.placeholder.com/300x400?text=Item+${i}`,
    });
  }
  return mock;
}

// This hook abstracts the data fetching logic for the wardrobe page. In a real
// app it would call a backend endpoint, but here we return a fixed set of
// mock items and simulate a loading state. The component can destructure the
// returned object just as the user requested.
export default function useWardrobe() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let canceled = false;

    async function fetchData() {
      setLoading(true);
      try {
        // simulate network latency
        await new Promise((r) => setTimeout(r, 500));

        // generate mock items; this is the same helper used by the loader
        const mock = generateMockItems(100);

        if (!canceled) {
          setItems(mock);
          setError(null);
        }
      } catch {
        if (!canceled) setError("Failed to load wardrobe");
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      canceled = true;
    };
  }, []);

  return { items, loading, error };
}

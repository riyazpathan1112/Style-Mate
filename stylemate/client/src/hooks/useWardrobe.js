import { useState, useEffect, useCallback } from "react";
import { wardrobeAPI } from "../services/api";

export function useWardrobe() {
  const [wardrobe, setWardrobe]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState(null);

  const fetchWardrobe = useCallback(async () => {
    try {
      setLoading(true);
      const res = await wardrobeAPI.getAll();
      setWardrobe(res.data.data);
    } catch (e) {
      setError("Failed to load wardrobe");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWardrobe(); }, [fetchWardrobe]);

  const addItem = async (item) => {
    const res = await wardrobeAPI.add(item);
    setWardrobe(prev => [...prev, res.data.data]);
    return res.data.data;
  };

  const removeItem = async (id) => {
    await wardrobeAPI.remove(id);
    setWardrobe(prev => prev.filter(i => i.id !== id));
  };

  return { wardrobe, loading, error, addItem, removeItem, refetch: fetchWardrobe };
}

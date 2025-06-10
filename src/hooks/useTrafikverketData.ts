import { useEffect, useState, useCallback } from "react";
import { TrafikverketResult } from "../type/trafikverket";

export function useTrafikverketData() {
  const [data, setData] = useState<TrafikverketResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const cached = localStorage.getItem("cachedPaths");
    if (!cached) {
      setError("Inga filer har valts än. Vänligen välj filer genom att klicka på 'Set Paths'.");
      return;
    }

    const paths = JSON.parse(cached);
    const hasEmptyPaths = Object.values(paths).some(path => !path);
    
    if (hasEmptyPaths) {
      setError("Vänligen välj alla nödvändiga filer genom att klicka på 'Set Paths'.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = await window.electronAPI.getAllStatuses(paths);
      if ('error' in res) {
        setError(res.error);
        setData(null);
      } else {
        setData(res);
        setError(null);
      }
    } catch (err) {
      setError("Ett fel uppstod vid inläsning av data. Försök igen.");
      console.error("IPC error", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add a listener for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cachedPaths') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadData]);

  return { data, loading, error, reloadData: loadData };
}
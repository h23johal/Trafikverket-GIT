import { useEffect, useState } from "react";
import { TrafikverketResult } from "../type/trafikverket";

export function useTrafikverketData() {
  const [data, setData] = useState<TrafikverketResult[] | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem("cachedPaths");
    if (!cached) {
      console.warn("Inga paths cachade ännu.");
      return;
    }

    const paths = JSON.parse(cached);
    window.electronAPI
      .getAllStatuses(paths)
      .then((res) => setData(res))
      .catch((err) => console.error("IPC error", err));
  }, []);

  return data;
}
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { TrafikverketResult } from "../type/trafikverket";
import type { PathInputs } from "../type/electron-api";

const defaultPaths: PathInputs = {
  testedPath: "",
  untestedPath: "",
  planPath: "",
};

type StatusDataContextType = {
  data: TrafikverketResult[] | null;
  loading: boolean;
  error: string | null;
  reloadData: (pathsToUse?: PathInputs) => Promise<void>;
  paths: PathInputs;
  setPaths: (paths: PathInputs) => void;
};

const StatusDataContext = createContext<StatusDataContextType | undefined>(
  undefined
);

export const StatusDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [paths, setPathsState] = useState<PathInputs>(() => {
    const cached = localStorage.getItem("cachedPaths");
    console.log("StatusDataContext: Initial paths from localStorage:", cached);
    return cached ? JSON.parse(cached) : defaultPaths;
  });

  const [data, setData] = useState<TrafikverketResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);

  const reloadData = useCallback(
    async (pathsToUse?: PathInputs) => {
      const pathsToLoad = pathsToUse || paths;
      console.log(
        "StatusDataContext: reloadData called with paths:",
        pathsToLoad
      );

      const hasEmptyPaths = Object.values(pathsToLoad).some((path) => !path);
      if (hasEmptyPaths) {
        console.log("StatusDataContext: Empty paths detected");
        setError(
          "Vänligen välj alla nödvändiga filer genom att klicka på 'Set Paths'."
        );
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log(
          "StatusDataContext: Calling getAllStatuses with paths:",
          pathsToLoad
        );
        const result = await window.electronAPI.getAllStatuses(pathsToLoad);
        console.log("StatusDataContext: getAllStatuses result:", result);

        if ("error" in result) {
          console.log("StatusDataContext: Error in result:", result.error);
          setError(result.error);
          setData(null);
        } else {
          console.log(
            "StatusDataContext: Setting new data, length:",
            result.length
          );
          setData(result);
          setError(null);
          setDataVersion((prev) => prev + 1);
        }
      } catch (err) {
        console.error("StatusDataContext: Error in reloadData:", err);
        setError("Ett fel uppstod vid inläsning av data. Försök igen.");
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [paths]
  );

  const setPaths = useCallback(
    async (newPaths: PathInputs) => {
      console.log(
        "StatusDataContext: setPaths called with new paths:",
        newPaths
      );
      console.log("StatusDataContext: Current paths:", paths);

      // Clear existing data before loading new data
      setData(null);
      setError(null);

      // Update paths
      localStorage.setItem("cachedPaths", JSON.stringify(newPaths));
      console.log("StatusDataContext: Updated localStorage with new paths");

      setPathsState(newPaths);
      console.log("StatusDataContext: Updated paths state");

      // Force a new data load with the new paths
      await reloadData(newPaths);
      console.log("StatusDataContext: reloadData completed");
    },
    [reloadData]
  );

  // Initial data load - only run once on mount
  useEffect(() => {
    console.log("StatusDataContext: Initial mount effect");
    const hasEmptyPaths = Object.values(paths).some((path) => !path);
    if (!hasEmptyPaths) {
      console.log("StatusDataContext: Initial data load");
      reloadData();
    }
  }, []); // Empty dependency array means this only runs once on mount

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cachedPaths" && e.newValue) {
        console.log("StatusDataContext: Storage change detected:", e.newValue);
        const newPaths = JSON.parse(e.newValue);
        setPathsState(newPaths);
        reloadData(newPaths);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [reloadData]);

  return (
    <StatusDataContext.Provider
      value={{ data, loading, error, reloadData, paths, setPaths }}
    >
      {children}
    </StatusDataContext.Provider>
  );
};

export const useStatusData = () => {
  const ctx = useContext(StatusDataContext);
  if (!ctx)
    throw new Error("useStatusData must be used inside StatusDataProvider");
  return ctx;
};

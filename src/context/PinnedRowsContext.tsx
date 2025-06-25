import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

type PinnedRowsContextType = {
  pinnedIds: string[];
  togglePin: (id: string) => void;
  pinAll: (ids: string[]) => void;
  unpinAll: (ids: string[]) => void;
  isPinned: (id: string) => boolean;
};

const PinnedRowsContext = createContext<PinnedRowsContextType | undefined>(
  undefined
);

export const PinnedRowsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("pinnedList");
    return saved ? JSON.parse(saved) : [];
  });

  // Create a Set for O(1) lookup performance
  const pinnedIdsSet = useMemo(() => new Set(pinnedIds), [pinnedIds]);

  useEffect(() => {
    localStorage.setItem("pinnedList", JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  const togglePin = (id: string) => {
    setPinnedIds((prev) =>
      pinnedIdsSet.has(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const pinAll = (ids: string[]) => {
    setPinnedIds((prev) => [...new Set([...prev, ...ids])]);
  };

  const unpinAll = (ids: string[]) => {
    const idsToRemove = new Set(ids);
    setPinnedIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
  };

  const isPinned = (id: string) => pinnedIdsSet.has(id);

  return (
    <PinnedRowsContext.Provider
      value={{ pinnedIds, togglePin, pinAll, unpinAll, isPinned }}
    >
      {children}
    </PinnedRowsContext.Provider>
  );
};

export const usePinnedRows = () => {
  const ctx = useContext(PinnedRowsContext);
  if (!ctx)
    throw new Error("usePinnedRows must be used within PinnedRowsProvider");
  return ctx;
};

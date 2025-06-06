import React, { createContext, useContext, useState, useEffect } from "react";

type PinnedRowsContextType = {
  pinnedIds: number[];
  togglePin: (id: number) => void;
  pinAll: (ids: number[]) => void;
  unpinAll: (ids: number[]) => void;
  isPinned: (id: number) => boolean;
};

const PinnedRowsContext = createContext<PinnedRowsContextType | undefined>(undefined);

export const PinnedRowsProvider = ({ children }: { children: React.ReactNode }) => {
  const [pinnedIds, setPinnedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem("pinnedList");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("pinnedList", JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  const togglePin = (id: number) => {
    setPinnedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const pinAll = (ids: number[]) => {
    setPinnedIds((prev) => [...new Set([...prev, ...ids])]);
  };

  const unpinAll = (ids: number[]) => {
    setPinnedIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const isPinned = (id: number) => pinnedIds.includes(id);

  return (
    <PinnedRowsContext.Provider value={{ pinnedIds, togglePin, pinAll, unpinAll, isPinned }}>
      {children}
    </PinnedRowsContext.Provider>
  );
};

export const usePinnedRows = () => {
  const ctx = useContext(PinnedRowsContext);
  if (!ctx) throw new Error("usePinnedRows must be used within PinnedRowsProvider");
  return ctx;
};

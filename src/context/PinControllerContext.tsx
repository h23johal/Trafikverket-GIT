// context/PinControllerContext.tsx
import React, { createContext, useContext } from "react";
import { usePinnedRows } from "../context/PinnedRowsContext";
import { TrafikverketResult } from "@/type/trafikverket";

const PinControllerContext = createContext<
  { pinOverdue: (data: TrafikverketResult[]) => void } | undefined
>(undefined);

export const PinControllerProvider: React.FC<{
  children: React.ReactNode;
  data: TrafikverketResult[];
}> = ({ children, data }) => {
  const { pinAll } = usePinnedRows();

  const pinOverdue = (rows: TrafikverketResult[]) => {
    const overdue = rows.filter((d) => d.deadline_status === "Overdue");
    const ids = overdue.map((d) => d.id);
    pinAll(ids);
  };

  return (
    <PinControllerContext.Provider
      value={{ pinOverdue: (rows) => pinOverdue(rows || data) }}
    >
      {children}
    </PinControllerContext.Provider>
  );
};

export const usePinController = () => {
  const ctx = useContext(PinControllerContext);
  if (!ctx)
    throw new Error(
      "usePinController must be used within PinControllerProvider"
    );
  return ctx;
};

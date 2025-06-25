import { useState } from "react";
import StatusCard from "./components/StatusCard";
import TestTable from "./components/TestTable";
import { PathModal } from "./components/PathModal";
import "./App.css";
import "./type/electron-api.d";
import { isOverdue } from "./hooks/overdueChecker";
import { StatusDataProvider, useStatusData } from "./context/StatusDataContext";
import { PinnedRowsProvider } from "./context/PinnedRowsContext";
import { usePinnedRows } from "./context/PinnedRowsContext";
import SegmentDetailCard from "./components/SegmentDetailCard";
import { PinControllerProvider } from "./context/PinControllerContext";
import { TrafikverketResult } from "@/type/trafikverket";
import UpdaterComponent from "./components/UpdaterComponent";
import { ThemeProvider } from "./contexts/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";

function AppContent() {
  const [selectedRow, setSelectedRow] = useState<TrafikverketResult | null>(
    null
  );
  const { data, loading, error } = useStatusData();

  const overdueIds = data?.filter(isOverdue).map((d) => d.id) ?? [];
  const { pinAll } = usePinnedRows();

  // Get IDs for overdue pending items (for pinning functionality)
  const overduePendingIds =
    data
      ?.filter(
        (d) =>
          d.deadline_status === "Overdue" &&
          (d.status === "Planerad" || d.status === "Otilldelad")
      )
      .map((d) => d.id) ?? [];

  const totalSections = new Set(data?.map((d) => d.id)).size;
  const uneIds = new Set(data?.map((d) => d.une_id));
  const testsCompleted =
    data?.filter((d) => d.status === "Färdigtestad").length ?? 0;
  const testsPlanned = data?.filter((d) => d.status === "Planerad").length ?? 0;
  const overdue =
    data?.filter(
      (d) =>
        d.deadline_status === "Overdue" &&
        (d.status === "Planerad" || d.status === "Otilldelad")
    ).length ?? 0;
  const next30 =
    data?.filter(
      (d) =>
        d.days_until !== null &&
        d.days_until >= -30 &&
        d.days_until <= 0 &&
        (d.status === "Planerad" || d.status === "Otilldelad")
    ).length ?? 0;
  const pastPlanned = data?.filter((d) => isOverdue(d)).length ?? 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-300">Laddar data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white dark:bg-gray-900">
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <PathModal />
      </div>
    );
  }

  return (
    <PinControllerProvider data={data ?? []}>
      <div className="min-h-screen px-4 bg-gray-100 dark:bg-gray-900">
        <div className="w-full pt-6">
          {/* Header */}
          <div className="flex items-center justify-between w-full mb-4">
            <PathModal />
            <h1 className="text-2xxl font-bold text-center tracking-tight text-slate-800 bg-gradient-to-r from-emerald-500 to-cyan-600 bg-clip-text text-transparent">
              BandelView
            </h1>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <UpdaterComponent />
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-7 gap-4 w-full mb-6">
            <StatusCard
              title="Total Sections"
              count={totalSections}
              color="text-slate-600 dark:text-slate-300"
            />
            <StatusCard
              title="Unique UNE IDs"
              count={uneIds.size}
              color="text-indigo-600 dark:text-indigo-400"
            />
            <StatusCard
              title="Tests Completed"
              count={testsCompleted}
              color="text-emerald-600 dark:text-emerald-400"
            />
            <StatusCard
              title="Tests Planned"
              count={testsPlanned}
              color="text-amber-600 dark:text-amber-400"
            />
            <StatusCard
              title="Pending Overdue"
              count={overdue}
              color="text-red-600 dark:text-red-400"
              onClick={
                overdue > 0
                  ? () => {
                      console.log(
                        "click: pinning overdue pending",
                        overduePendingIds
                      );
                      pinAll(overduePendingIds);
                    }
                  : undefined
              }
              hoverTooltip={
                overdue > 0 ? "Klicka för att pinna alla" : undefined
              }
              hoverColor="hover:bg-red-50 dark:hover:bg-red-900/20"
            />
            <StatusCard
              title="Pending Next 30 Days"
              count={next30}
              color="text-orange-600 dark:text-orange-400"
            />
            <StatusCard
              title="5Days over planned"
              count={pastPlanned}
              color="text-red-600 dark:text-red-400"
              className={
                pastPlanned > 0
                  ? "bg-red-50 dark:bg-red-900/20 shadow-[0_0_10px_#fecaca] ring-1 ring-red-200 dark:ring-red-800"
                  : ""
              }
              onClick={
                pastPlanned > 0
                  ? () => {
                      console.log("click: pinning", overdueIds);
                      pinAll(overdueIds);
                    }
                  : undefined
              }
              hoverTooltip={
                pastPlanned > 0 ? "Klicka för att pinna alla" : undefined
              }
              hoverColor="hover:bg-red-100 dark:hover:bg-red-900/30"
            />
          </div>

          {/* Main Content */}
          <div className="flex gap-4 w-full">
            <div className="flex-1">
              <TestTable onSelectRow={setSelectedRow} />
            </div>
            <div className="w-80">
              <SegmentDetailCard
                segment={selectedRow}
                onClose={() => setSelectedRow(null)}
              />
            </div>
          </div>
        </div>
      </div>
    </PinControllerProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <StatusDataProvider>
        <PinnedRowsProvider>
          <AppContent />
        </PinnedRowsProvider>
      </StatusDataProvider>
    </ThemeProvider>
  );
}

export default App;

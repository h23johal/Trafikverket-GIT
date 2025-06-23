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

function AppContent() {
  const [selectedRow, setSelectedRow] = useState<TrafikverketResult | null>(
    null
  );
  const { data, loading, error } = useStatusData();

  const overdueIds = data?.filter(isOverdue).map((d) => d.id) ?? [];
  const { pinAll } = usePinnedRows();
  const totalSections = new Set(data?.map((d) => d.id)).size;
  const uneIds = new Set(data?.map((d) => d.une_id));
  const testsCompleted =
    data?.filter((d) => d.status === "Färdigtestad").length ?? 0;
  const testsPlanned = data?.filter((d) => d.status === "Planerad").length ?? 0;
  const overdue =
    data?.filter((d) => d.deadline_status === "Overdue").length ?? 0;
  const next30 =
    data?.filter(
      (d) => d.days_until !== null && d.days_until >= -30 && d.days_until <= 0
    ).length ?? 0;
  const pastPlanned = data?.filter((d) => isOverdue(d)).length ?? 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-600">Laddar data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 mb-4">{error}</div>
        <PathModal />
      </div>
    );
  }

  return (
    <PinControllerProvider data={data ?? []}>
      <div className="p-6 grid grid-cols-10 space-y-3 bg-gray-100 w-[95vw]">
        <div className="grid grid-cols-6 col-span-10">
          <div className="col-span-1">
            <PathModal />
          </div>
          <h1 className="text-xl font-semibold col-span-4">
            Railway Test Management Dashboard
          </h1>
          <div className="p-6">
            <UpdaterComponent />
          </div>
        </div>
        
        <div className="col-span-10 mx-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
          <StatusCard
            title="Total Sections"
            count={totalSections}
            color="text-blue-600"
          />
          <StatusCard
            title="Unique UNE IDs"
            count={uneIds.size}
            color="text-purple-600"
          />
          <StatusCard
            title="Tests Completed"
            count={testsCompleted}
            color="text-green-600"
          />
          <StatusCard
            title="Tests Planned"
            count={testsPlanned}
            color="text-yellow-600"
          />
          <StatusCard
            title="Pending Overdue"
            count={overdue}
            color="text-red-600"
          />
          <StatusCard
            title="Pending Next 30 Days"
            count={next30}
            color="text-orange-500"
          />
          <StatusCard
            title="5Days over planned"
            count={pastPlanned}
            color="text-red-600"
            className={
              pastPlanned > 0
                ? "bg-red-100 shadow-[0_0_10px_#fecaca] ring-1 ring-red-200"
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
            hoverColor="hover:bg-red-200"
          />
        </div>
        <div className="col-span-8 mx-2">
          <TestTable onSelectRow={setSelectedRow} />
        </div>
        <div className="col-span-2 mx-2 h-full">
          <SegmentDetailCard
            segment={selectedRow}
            onClose={() => setSelectedRow(null)}
          />
        </div>
      </div>
    </PinControllerProvider>
  );
}

function App() {
  return (
    <StatusDataProvider>
      <PinnedRowsProvider>
        <AppContent />
      </PinnedRowsProvider>
    </StatusDataProvider>
  );
}

export default App;

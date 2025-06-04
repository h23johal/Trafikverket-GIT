import { useState } from 'react'
import StatusCard from "./components/StatusCard";
import TestTable from "./components/TestTable";
import FilterControls from "./components/FilterControls";
import StatusSummary from "./components/StatusSummary";
import LengthSummary from "./components/LengthSummary";
import PathModal from "./components/PathModal";
import './App.css'
import "./type/electron-api.d";
import { useTrafikverketData } from "./hooks/useTrafikverketData";



function App() {
  const [count, setCount] = useState(0)
  const [selectedUneId, setSelectedUneId] = useState<string | null>(null);
  const [selectedBandel, setSelectedBandel] = useState<string | null>(null);
  const data = useTrafikverketData();

  const uneIds = new Set(data?.map((d) => d.une_id));
  const testsCompleted = data?.filter((d) => d.status === "Färdigtestad").length ?? 0;
  const testsPlanned = data?.filter((d) => d.status === "Planerad").length ?? 0;
  const overdue = data?.filter((d) => d.deadline_status === "Overdue").length ?? 0;
  const next30 = data?.filter((d) =>
    d.days_until !== null && d.days_until >= -30 && d.days_until <= 0
  ).length ?? 0;
  return (
    <div className="p-6 space-y-8 bg-gray-100 min-h-screen">
      <h1 className="text-xl font-semibold">Railway Test Management Dashboard</h1>
      <PathModal />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatusCard title="Total Sections" count="–" color="text-blue-600" />
        <StatusCard title="Unique UNE IDs" count={uneIds.size} color="text-purple-600" />
        <StatusCard title="Tests Completed" count={testsCompleted} color="text-green-600" />
        <StatusCard title="Tests Planned" count={testsPlanned} color="text-yellow-600" />
        <StatusCard title="Pending Overdue" count={overdue} color="text-red-600" />
        <StatusCard title="Pending Next 30 Days" count={next30} color="text-orange-500" />
      </div>

      <TestTable />
      <FilterControls />
      <StatusSummary />
      <LengthSummary />
    </div>
  );
};

export default App;
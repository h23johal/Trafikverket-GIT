import { useState } from 'react'
import StatusCard from "./components/StatusCard";
import TestTable from "./components/TestTable";
import FilterControls from "./components/FilterControls";
import StatusSummary from "./components/StatusSummary";
import LengthSummary from "./components/LengthSummary";
import './App.css'


function App() {
  const [count, setCount] = useState(0)
  return (
    <div className="p-6 space-y-8 bg-gray-100 min-h-screen">
      <h1 className="text-xl font-semibold">Railway Test Management Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatusCard title="Total Sections" count="0" color="text-blue-600" />
        <StatusCard title="Unique UNE IDs" count="0" color="text-purple-600" />
        <StatusCard title="Tests Completed" count="0" color="text-green-600" />
        <StatusCard title="Tests Planned" count="0" color="text-yellow-600" />
        <StatusCard title="Pending Overdue" count="0" color="text-red-600" />
        <StatusCard title="Pending Next 30 Days" count="0" color="text-orange-500" />
      </div>

      <TestTable />
      <FilterControls />
      <StatusSummary />
      <LengthSummary />
    </div>
  );
};

export default App;
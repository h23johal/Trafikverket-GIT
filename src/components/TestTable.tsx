import React from "react";
import { useTrafikverketData } from "../hooks/useTrafikverketData";

const TestTable: React.FC = () => {
  const data = useTrafikverketData();

  const columns = [
    "ID", "SDMS UNE ID", "Bandel", "Status", "Last Test",
    "Planned 2025", "Next Test", "Days Until",
    "Km From", "Km To", "Length"
  ];

  const getDaysUntilColor = (days: number | null) => {
    if (days === null) return "bg-gray-200";
    if (days < -30) return "bg-green-200";
    if (days < -14) return "bg-yellow-200";
    return "bg-red-200";
  };

  const getStatusColor = (status: string) => {
  switch (status) {
    case "Färdigtestad":
      return "bg-green-200";
    case "Delvis testad":
      return "bg-yellow-200";
    case "Planerad":
      return "bg-blue-200";
    case "Otilldelad":
      return "bg-gray-300";
    default:
      return "bg-white";
  }
};

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Test Log</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((label, i) => (
                <th key={i} className="border px-4 py-2 whitespace-nowrap">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data
                .filter((row) => row.tested_date === null)
                .map((row) => (
                <tr key={row.id}>
                  <td className="border px-4 py-1">{row.id}</td>
                  <td className="border px-4 py-1">{row.une_id}</td>
                  <td className="border px-4 py-1">{row.bandel}</td>
                  <td className={`border px-4 py-1 font-medium text-center ${getStatusColor(row.status)}`}>{row.status}</td>
                  <td className="border px-4 py-1">{row.last_previous_test ? new Date(row.last_previous_test).toLocaleDateString() : ''}</td>
                  <td className="border px-4 py-1">{row.planned_date ? new Date(row.planned_date).toLocaleDateString() : ''}</td>
                  <td className="border px-4 py-1">{row.next_test_date ? new Date(row.next_test_date).toLocaleDateString() : ''}</td>
                  <td className={`border px-4 py-1 text-center ${getDaysUntilColor(row.days_until)}`}>
                    {row.days_until ?? "-"}
                  </td>
                  <td className="border px-4 py-1">{row.km_from}</td>
                  <td className="border px-4 py-1">{row.km_to}</td>
                  <td className="border px-4 py-1">{row.total_length_km}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  All tests have been completed or no tests match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};



export default TestTable;

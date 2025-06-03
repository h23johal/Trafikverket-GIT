import React from "react";

const TestTable: React.FC = () => {
  const columns: string[] = [
    "ID", "SDMS UNE ID", "Bandel", "Status", "Last Test",
    "Planned 2025", "Next Test", "Days Until",
    "Km From", "Km To", "Length"
  ];

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-2">IDs not yet tested</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((label: string, i: number) => (
                <th key={i} className="border px-4 py-2">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={11} className="text-center py-4">
                All tests have been completed or no tests match the current filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestTable;
  
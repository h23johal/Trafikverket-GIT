import React from "react";

const StatusSummary: React.FC = () => {
  const statuses: string[] = ["Tested", "Planned", "Pending"];

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Status Summary</h2>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Count</th>
            <th className="border px-4 py-2">Percentage</th>
          </tr>
        </thead>
        <tbody>
          {statuses.map((status: string, i: number) => (
            <tr key={i} className="text-center">
              <td className="border px-4 py-2">{status}</td>
              <td className="border px-4 py-2">0</td>
              <td className="border px-4 py-2">NaN%</td>
            </tr>
          ))}
          <tr className="text-center font-bold">
            <td className="border px-4 py-2">Total</td>
            <td className="border px-4 py-2">0</td>
            <td className="border px-4 py-2">100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default StatusSummary;

  
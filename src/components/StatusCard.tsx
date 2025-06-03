import React from "react";

interface StatusCardProps {
  title: string;
  count: string | number;
  color: string; // t.ex. "text-blue-600"
}

const StatusCard: React.FC<StatusCardProps> = ({ title, count, color }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow w-full">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className={`text-2xl font-bold ${color}`}>{count}</div>
    </div>
  );
};

export default StatusCard;

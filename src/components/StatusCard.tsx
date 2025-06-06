import React from "react";

interface StatusCardProps {
  title: string;
  count: string | number;
  color: string; // t.ex. "text-blue-600"
  className?: string;
  onClick?: () => void;
  hoverTooltip?: string;
  hoverColor?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  count,
  color,
  className = "",
  onClick,
  hoverTooltip,
  hoverColor,
}) => {
  const isClickable = typeof onClick === "function";
  const baseClass = `relative rounded-xl p-0 shadow w-full min-w-[150px] ${
    className || "bg-white"
  } ${
    isClickable ? `cursor-pointer ${hoverColor ?? "hover:bg-gray-200"}` : ""
  } group transition`;

  return (
    <div className={baseClass} onClick={onClick}>
      {hoverTooltip && (
        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white text-xs text-gray-700 border rounded px-2 py-1 shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
          {hoverTooltip}
        </div>
      )}
      <div className="text-gray-500 text-sm">{title}</div>
      <div className={`text-2xl font-bold ${color}`}>{count}</div>
    </div>
  );
};

export default StatusCard;

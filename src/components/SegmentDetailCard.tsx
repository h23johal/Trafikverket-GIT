import React from "react";
import { TrafikverketResult } from "@/type/trafikverket";

type Props = {
  segment: TrafikverketResult | null;
  onClose?: () => void;
};

const SegmentDetailCard: React.FC<Props> = ({ segment, onClose }) => {
  if (!segment) {
    return (
      <div className="p-4 border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
        Välj en rad i tabellen för att se detaljer här.
      </div>
    );
  }

  const formatDate = (dateStr: string | null) =>
    dateStr ? new Date(dateStr).toLocaleDateString("sv-SE") : "–";

  const progressColor =
    segment.coverage_pct >= 100
      ? "bg-emerald-500"
      : segment.coverage_pct >= 70
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className="border p-4 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 shadow-lg mt-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            SDMS UNE ID: {segment.une_id_raw}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Driftsområde: {segment.driftsomr} · Bandel: {segment.bandel}· UNE:{" "}
            {segment.une}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 border-0"
            title="Stäng"
          >
            ✕
          </button>
        )}
      </div>

      {/* Coverage */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>Täckning</span>
          <span>{segment.coverage_pct.toFixed(1)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor}`}
            style={{ width: `${segment.coverage_pct}%` }}
          ></div>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
        <div>
          <strong>Status:</strong> {segment.status}
        </div>
        <div>
          <strong>Testad längd:</strong> {segment.tested_length_km} km
        </div>
        <div>
          <strong>Total längd:</strong> {segment.total_length_km} km
        </div>
        <div>
          <strong>Nästa testdatum:</strong> {formatDate(segment.next_test_date)}
        </div>
        <div>
          <strong>Deadline:</strong> {formatDate(segment.deadline)}
        </div>
        <div>
          <strong>Senast testad:</strong> {formatDate(segment.tested_date)}
        </div>
        <div>
          <strong>Planerat test:</strong> {formatDate(segment.planned_date)}
        </div>
        <div>
          <strong>Testad:</strong> {formatDate(segment.tested_date)}
        </div>
        {segment.gaps.length > 0 && (
          <div className="col-span-2">
            <strong>Luckor:</strong>
            <ul className="mt-1 ml-4 list-disc text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
              {segment.gaps.map((gap, idx) => (
                <li key={idx}>
                  {gap.start_km.toFixed(2)} km – {gap.end_km.toFixed(2)} km (
                  {gap.length_km.toFixed(2)} km)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SegmentDetailCard;

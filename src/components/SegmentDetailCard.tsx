import React from "react";
import { TrafikverketResult } from "@/type/trafikverket";

type Props = {
  segment: TrafikverketResult | null;
  onClose?: () => void;
};

const SegmentDetailCard: React.FC<Props> = ({ segment, onClose }) => {
  if (!segment) {
    return (
      <div className="p-4 border rounded bg-gray-100 w-full text-gray-500 text-sm">
        Välj en rad i tabellen för att se detaljer här.
      </div>
    );
  }

  const formatDate = (dateStr: string | null) =>
    dateStr ? new Date(dateStr).toLocaleDateString("sv-SE") : "–";

  const progressColor =
    segment.coverage_pct >= 100
      ? "bg-green-500"
      : segment.coverage_pct >= 70
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="p-6 border rounded-xl w-full bg-white shadow-lg mt-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            SDMS UNE ID: {segment.une_id_raw}
          </h3>
          <p className="text-sm text-gray-500">
            Driftsområde: {segment.driftsomr} · Bandel: {segment.bandel}· UNE:{" "}
            {segment.une}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition bg-gray-500"
            title="Stäng"
          >
            ✕
          </button>
        )}
      </div>

      {/* Coverage */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <span>Täckning</span>
          <span>{segment.coverage_pct.toFixed(1)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor}`}
            style={{ width: `${segment.coverage_pct}%` }}
          ></div>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
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
            <ul className="mt-1 ml-4 list-disc text-sm text-gray-600 space-y-0.5">
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

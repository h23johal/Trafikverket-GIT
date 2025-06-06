import React from "react";
import { TrafikverketResult } from "@/type/trafikverket";

interface SegmentDetailProps {
  segment: TrafikverketResult;
  onClose: () => void;
}

const SegmentDetail: React.FC<SegmentDetailProps> = ({ segment, onClose }) => {
  return (
    <div className="bg-gray-50 border-t border-gray-300 mt-6 p-4 rounded-md shadow-inner">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Detaljer för UNE-ID: {segment.une_id}</h3>
        <button
          onClick={onClose}
          className="text-sm text-gray-600 hover:text-black"
        >
          Stäng ✕
        </button>
      </div>

      <p><strong>Status:</strong> {segment.status}</p>
      <p><strong>Testtäckning:</strong> {segment.coverage_pct}% ({segment.tested_length_km} km av {segment.total_length_km} km)</p>

      <div className="mt-4">
        <h4 className="font-semibold mb-1">Ej testade sträckor:</h4>
        {segment.gaps.length === 0 ? (
          <p className="text-sm text-gray-600">Inga otäckta sträckor.</p>
        ) : (
          <ul className="list-disc list-inside text-sm">
            {segment.gaps.map((gap, index) => (
              <li key={index}>
                {gap.start_km} km → {gap.end_km} km ({gap.length_km} km)
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SegmentDetail;

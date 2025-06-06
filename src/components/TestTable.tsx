import React, {useState, useMemo, useEffect} from "react";
import { useTrafikverketData } from "../hooks/useTrafikverketData";
import FiltersSelect from "./FiltersSelect";
import { TrafikverketResult } from "@/type/trafikverket";


const TestTable: React.FC = () => {
  const data = useTrafikverketData();

  const [selectedFilters, setSelectedFilters] = useState<{
    status: string[];
    une_id: string[];
    bandel: string[];
    driftsomr: string[];
    une: string[],
  }>({
    status: [],
    une_id: [],
    bandel: [],
    driftsomr: [],
    une: [],
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof TrafikverketResult;
    direction: "asc" | "desc";
  }>({ key: "id", direction: "asc" });

  function matchFilters(row: any, filters: typeof selectedFilters): boolean {
    const matchesStatus =
      filters.status.length === 0 || filters.status.includes(row.status);

    const matchesUneId =
      filters.une_id.length === 0 || filters.une_id.includes(row.une_id);

    const matchesBandel =
      filters.bandel.length === 0 || filters.bandel.includes(row.bandel);

    const matchesUne =
      filters.une.length === 0 || filters.une.includes(row.une);

    const matchesDriftsomr =
      filters.driftsomr.length === 0 || filters.driftsomr.includes(row.driftsomr);

    return matchesStatus && matchesUneId && matchesBandel && matchesDriftsomr && matchesUne;
  }
  const columns = [
    "ID", "SDMS UNE ID", "Bandel", "Status", "Last Test",
    "Planned 2025", "Next Test", "Days Until",
    "Km From", "Km To", "Length"
  ];

  const columnKeyMap: { [label: string]: keyof TrafikverketResult } = {
  "ID": "id",
  "SDMS UNE ID": "une_id",
  "Bandel": "bandel",
  "Status": "status",
  "Planned 2025": "planned_date",
  "Next Test": "next_test_date",
  "Days Until": "days_until",
  // ...lägg till fler vid behov
  };

  const getAvailableOptions = (
    key: keyof typeof selectedFilters,
    data: any[],
    filters: typeof selectedFilters
  ): string[] => {
    return Array.from(
      new Set(
        data
          .filter((row) =>
            Object.entries(filters).every(([filterKey, selected]) => {
              if (filterKey === key) return true; // vi filtrerar inte på oss själva
              return selected.length === 0 || selected.includes(row[filterKey]);
            })
          )
          .map((row) => row[key])
          .filter(Boolean)
      )
    );
  };

  const statusList = useMemo(() => getAvailableOptions("status", data ?? [], selectedFilters), [data, selectedFilters]);
  const uneIdList = useMemo(() => getAvailableOptions("une_id", data ?? [], selectedFilters), [data, selectedFilters]);
  const bandelList = useMemo(() => getAvailableOptions("bandel", data ?? [], selectedFilters), [data, selectedFilters]);
  const driftsomrList = useMemo(() => getAvailableOptions("driftsomr", data ?? [], selectedFilters), [data, selectedFilters]);
  const uneList = useMemo(() => getAvailableOptions("une", data ?? [], selectedFilters), [data, selectedFilters]);

  const sortedData = useMemo(() => {
    if (!data) return [];
    const filtered = data.filter((row) => matchFilters(row, selectedFilters));
    const sorted = [...filtered].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, selectedFilters, sortConfig]);

  const [pinnedIds, setPinnedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem("pinnedIds");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("pinnedList", JSON.stringify(pinnedIds));
  }, [pinnedIds]);


  const handleTogglePin = (id: number) => {
    setPinnedIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const getDaysUntilColor = (days: number | null) => {
    if (days === null) return "bg-gray-200";
    if (days < -30) return "bg-green-200";
    if (days < 0) return "bg-yellow-200";
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

  if (!data) return <div>Loading...</div>;

  const TestTableRow: React.FC<{
    row: TrafikverketResult;
    isPinned: boolean;
    isSticky?: boolean;
    stickyOffset?: number;
    onTogglePin: (id: number) => void;
  }> = ({ row, isPinned, isSticky = false, stickyOffset= 0, onTogglePin }) => {
    return (
      <tr
        className={`${isPinned ? "bg-sky-100 z-20" : ""} ${isSticky ? "sticky" : ""}`}
        style={isSticky ? { top: `${(stickyOffset ?? 0) * 48 + 40}px` } : {}}
      >
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
        <td className="border px-4 py-1 text-center">
          <button
            className="text-gray-500 hover:text-gray-900 bg-gray-100"
            title={isPinned ? "Unpin" : "Pin"}
            onClick={() => onTogglePin(row.id)}
          >
            {isPinned ? "📌" : "📍"}
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Test Log</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-2">
        <FiltersSelect
          title="Status"
          options={statusList}
          selected={selectedFilters.status}
          onChange={(vals) =>
            setSelectedFilters((prev) => ({ ...prev, status: vals }))
          }
          modes={["checkbox", "dropdown"]} // checkboxes in dropdown
        />

        <FiltersSelect
          title="UNE ID"
          options={uneIdList}
          selected={selectedFilters.une_id}
          onChange={(vals) =>
            setSelectedFilters((prev) => ({ ...prev, une_id: vals }))
          }
          modes={["dropdown", "dropdown"]} // simple dropdown, no checkboxes
        />

        <FiltersSelect
          title="Bandel"
          options={bandelList}
          selected={selectedFilters.bandel}
          onChange={(vals) =>
            setSelectedFilters((prev) => ({ ...prev, bandel: vals }))
          }
          modes={["checkbox", "dropdown"]} // static checkboxes without dropdown
        />

        <FiltersSelect
          title="Driftsområde"
          options={driftsomrList}
          selected={selectedFilters.driftsomr}
          onChange={(vals) =>
            setSelectedFilters((prev) => ({ ...prev, driftsomr: vals }))
          }
          modes={["checkbox", "dropdown"]} // static checkboxes without dropdown
        />

        <FiltersSelect
          title="UNE"
          options={uneList}
          selected={selectedFilters.une}
          onChange={(vals) =>
            setSelectedFilters((prev) => ({ ...prev, une: vals }))
          }
          modes={["checkbox", "dropdown"]} // static checkboxes without dropdown
        />
      </div>
      <div className="overflow-x-auto">
  {/* Pinned table */}
  {pinnedIds.length > 0 && (
  <div className="h-64 overflow-y-scroll mb-4 border border-gray-300 rounded">
    <table className="min-w-full text-sm table-fixed border-collapse">
      <thead className="sticky top-0 bg-gray-100 z-10">
        <tr>
          {columns.map((label, i) => {
            const key = columnKeyMap[label];
            const isSorted = sortConfig.key === key;
            return (
              <th
                key={i}
                className="border px-4 py-2 whitespace-nowrap cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  if (!key) return; // skip unknown keys
                  setSortConfig((prev) => ({
                    key,
                    direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
                  }));
                }}
              >
                {label}
                {isSorted && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "🔼" : "🔽"}</span>
                )}
              </th>
            );
          })}
          <th className="border px-4 py-2">📌</th>
        </tr>
      </thead>
      <tbody>
        {pinnedIds.map((id) => {
          const row = data.find((r) => r.id === id);
          return row ? (
            <TestTableRow
              key={`pin-${row.id}`}
              row={row}
              isPinned={true}
              onTogglePin={handleTogglePin}
            />
          ) : null;
        })}
      </tbody>
    </table>
  </div>
)}

  {/* Main scrollable table */}
  <div className="max-h-[400px] overflow-y-scroll border-t border-gray-300">
    <table className="min-w-full text-sm table-fixed border-collapse">
      <thead className="sticky top-0 bg-gray-100 z-10">
        <tr>
          {columns.map((label, i) => {
            const key = columnKeyMap[label];
            const isSorted = sortConfig.key === key;
            return (
              <th
                key={i}
                className="border px-4 py-2 whitespace-nowrap cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  if (!key) return; // skip unknown keys
                  setSortConfig((prev) => ({
                    key,
                    direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
                  }));
                }}
              >
                {label}
                {isSorted && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "🔼" : "🔽"}</span>
                )}
              </th>
            );
          })}
          <th className="border px-4 py-2">📌</th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row) => (
          <TestTableRow
            key={row.id}
            row={row}
            isPinned={pinnedIds.includes(row.id)}
            onTogglePin={handleTogglePin}
          />
        ))}
      </tbody>
    </table>
  </div>
</div>

    </div>
  );
};



export default TestTable;

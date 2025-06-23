import React, { useState, useMemo, useEffect } from "react";
import { useStatusData } from "../context/StatusDataContext";
import { isOverdue } from "../hooks/overdueChecker";
import { usePinnedRows } from "../context/PinnedRowsContext";
import FiltersSelect from "./FiltersSelect";
import { TrafikverketResult } from "@/type/trafikverket";
import { TriStateMap, FiltersState } from "@/type/filters";
import { PathModal } from "./PathModal";

interface TestTableProps {
  onSelectRow: (row: TrafikverketResult) => void;
}

const TestTable: React.FC<TestTableProps> = ({ onSelectRow }) => {
  const { data, loading, error } = useStatusData();
  const { pinnedIds, togglePin, pinAll, isPinned, unpinAll } = usePinnedRows();
  const [selectedFilters, setSelectedFilters] = useState<FiltersState>({
    status: {},
    une_id: {},
    bandel: {},
    driftsomr: {},
    une: {},
    tested: {},
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof TrafikverketResult;
    direction: "asc" | "desc";
  }>({ key: "id", direction: "asc" });

  // Add state for visible columns
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      "ID",
      "SDMS UNE ID",
      "Bandel",
      "Status",
      "Tested",
      "Last Test",
      "Planned 2025",
      "Next Test",
      "Days Until",
      "Km From",
      "Km To",
      "Length",
    ])
  );

  // Add state for context menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Reset filters when data changes
  useEffect(() => {
    setSelectedFilters({
      status: {},
      une_id: {},
      bandel: {},
      driftsomr: {},
      une: {},
      tested: {},
    });
  }, [data]);

  function matchTriState(value: string, map: TriStateMap): boolean {
    const included = Object.entries(map)
      .filter(([_, state]) => state === "include")
      .map(([key]) => key);

    const excluded = Object.entries(map)
      .filter(([_, state]) => state === "exclude")
      .map(([key]) => key);

    if (included.length > 0) return included.includes(value);
    if (excluded.length > 0) return !excluded.includes(value);
    return true;
  }

  function matchFilters(
    row: TrafikverketResult,
    filters: FiltersState
  ): boolean {
    return (
      matchTriState(row.status, filters.status) &&
      matchTriState(row.une_id, filters.une_id) &&
      matchTriState(row.bandel.toString(), filters.bandel) &&
      matchTriState(row.driftsomr, filters.driftsomr) &&
      matchTriState(row.une, filters.une) &&
      matchTriState(row.tested_date ? "tested" : "not_tested", filters.tested)
    );
  }

  const columns = [
    "ID",
    "SDMS UNE ID",
    "Bandel",
    "Status",
    "Tested",
    "Last Test",
    "Planned 2025",
    "Next Test",
    "Days Until",
    "Km From",
    "Km To",
    "Length",
  ];

  const columnKeyMap: { [label: string]: keyof TrafikverketResult } = {
    ID: "id",
    "SDMS UNE ID": "une_id_raw",
    Bandel: "bandel",
    Status: "status",
    Tested: "tested_date",
    "Planned 2025": "planned_date",
    "Next Test": "next_test_date",
    "Days Until": "days_until",
    "Km From": "km_from",
    "Km To": "km_to",
    Length: "total_length_km",
  };

  const getAvailableOptions = <K extends keyof typeof selectedFilters>(
    key: K,
    data: any[],
    filters: typeof selectedFilters
  ): string[] => {
    return Array.from(
      new Set(
        data
          .filter((row) =>
            Object.entries(filters).every(([filterKey, map]) => {
              if (filterKey === key) return true; // Låt den vi bygger listan för passera
              const value = row[filterKey];
              const filterState = (map as TriStateMap)[value];

              if (filterState === "include") return true;
              if (filterState === "exclude") return false;
              return true; // neutral
            })
          )
          .map((row) => row[key])
          .filter(Boolean)
      )
    );
  };

  const statusList = useMemo(
    () => getAvailableOptions("status", data ?? [], selectedFilters),
    [data, selectedFilters]
  );
  const uneIdList = useMemo(
    () => getAvailableOptions("une_id", data ?? [], selectedFilters),
    [data, selectedFilters]
  );
  const bandelList = useMemo(
    () => getAvailableOptions("bandel", data ?? [], selectedFilters),
    [data, selectedFilters]
  );
  const driftsomrList = useMemo(
    () => getAvailableOptions("driftsomr", data ?? [], selectedFilters),
    [data, selectedFilters]
  );
  const uneList = useMemo(
    () => getAvailableOptions("une", data ?? [], selectedFilters),
    [data, selectedFilters]
  );

  const testedList = useMemo(
    () => ["tested"], // Just one option since we use tri-state
    []
  );

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
  }, [data, selectedFilters, sortConfig, pinnedIds]);

  const pinnedRows = useMemo(() => {
    if (!data) return [];
    return data.filter((row) => pinnedIds.includes(row.id));
  }, [data, pinnedIds]);

  useEffect(() => {
    if (pinnedIds.length && data?.length) {
      console.log("Pinned rows uppdateras efter båda är redo.");
    }
  }, [pinnedIds, data]);

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

  // Add context menu handler
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Add click outside handler to close context menu
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Add toggle column visibility handler
  const toggleColumnVisibility = (column: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(column)) {
        next.delete(column);
      } else {
        next.add(column);
      }
      return next;
    });
  };

  // Add show all columns handler
  const showAllColumns = () => {
    setVisibleColumns(new Set(columns));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-4 flex items-center justify-center">
        <div className="text-gray-600">Laddar data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-4">
        <div className="text-red-600 mb-4">{error}</div>
        <PathModal />
      </div>
    );
  }

  if (!data) return null;

  const TestTableRow: React.FC<{
    row: TrafikverketResult;
    isPinned: boolean;
    isSticky?: boolean;
    stickyOffset?: number;
    onTogglePin: (id: string) => void;
    onClick?: () => void;
    visibleColumns: Set<string>;
  }> = ({
    row,
    isPinned,
    isSticky = false,
    stickyOffset = 0,
    onTogglePin,
    onClick,
    visibleColumns,
  }) => {
    const shouldHighlightRed = isOverdue(row);

    return (
      <tr
        className={`${
          isPinned
            ? shouldHighlightRed
              ? "bg-red-100"
              : "bg-sky-100"
            : shouldHighlightRed
            ? "bg-red-300 border-red-300"
            : ""
        } ${isSticky ? "sticky" : ""} z-20`}
        style={isSticky ? { top: `${(stickyOffset ?? 0) * 48 + 40}px` } : {}}
      >
        {visibleColumns.has("ID") && (
          <td className="border px-2 py-1">{row.id}</td>
        )}
        {visibleColumns.has("SDMS UNE ID") && (
          <td
            className="border px-2 py-1 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={onClick}
            title="Klicka för att visa detaljer"
          >
            {row.une_id_raw}
          </td>
        )}
        {visibleColumns.has("Bandel") && (
          <td className="border px-2 py-1">{row.bandel}</td>
        )}
        {visibleColumns.has("Status") && (
          <td
            className={`border px-2 py-1 font-medium text-center ${getStatusColor(
              row.status
            )}`}
          >
            {row.status}
          </td>
        )}
        {visibleColumns.has("Tested") && (
          <td className="border px-2 py-1">
            {row.tested_date
              ? new Date(row.tested_date).toLocaleDateString()
              : "-"}
          </td>
        )}
        {visibleColumns.has("Last Test") && (
          <td className="border px-2 py-1">
            {row.last_previous_test
              ? new Date(row.last_previous_test).toLocaleDateString()
              : ""}
          </td>
        )}
        {visibleColumns.has("Planned 2025") && (
          <td className="border px-2 py-1">
            {row.planned_date
              ? new Date(row.planned_date).toLocaleDateString()
              : ""}
          </td>
        )}
        {visibleColumns.has("Next Test") && (
          <td className="border px-2 py-1">
            {row.next_test_date
              ? new Date(row.next_test_date).toLocaleDateString()
              : ""}
          </td>
        )}
        {visibleColumns.has("Days Until") && (
          <td
            className={`border px-2 py-1 text-center ${getDaysUntilColor(
              row.days_until
            )}`}
          >
            {row.days_until ?? "-"}
          </td>
        )}
        {visibleColumns.has("Km From") && (
          <td className="border px-2 py-1">{row.km_from}</td>
        )}
        {visibleColumns.has("Km To") && (
          <td className="border px-2 py-1">{row.km_to}</td>
        )}
        {visibleColumns.has("Length") && (
          <td className="border px-2 py-1">{row.total_length_km}</td>
        )}
        <td className="border px-2 py-1 text-center">
          <button
            className="text-gray-500 hover:text-gray-900 bg-gray-100"
            title={isPinned ? "Unpin" : "Pin"}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(row.id);
            }}
          >
            {isPinned ? "📌" : "📍"}
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="grid grid-cols-1 h-full md:grid-cols-6 gap-3 mb-2">
        <FiltersSelect
          title="Status"
          options={statusList}
          selected={selectedFilters.status}
          onChange={(vals) =>
            setSelectedFilters((prev) => ({ ...prev, status: vals }))
          }
          modes={["checkbox", "dropdown"]}
        />

        <FiltersSelect
          title="UNE ID"
          options={uneIdList}
          selected={selectedFilters.une_id}
          onChange={(vals) =>
            setSelectedFilters((prev) => ({ ...prev, une_id: vals }))
          }
          modes={["dropdown", "dropdown"]}
        />

        <FiltersSelect
          title="Bandel"
          options={bandelList}
          selected={selectedFilters.bandel}
          onChange={(vals) =>
            setSelectedFilters((prev) => ({ ...prev, bandel: vals }))
          }
          modes={["checkbox", "dropdown"]}
        />

        <FiltersSelect
          title="Driftsområde"
          options={driftsomrList}
          selected={selectedFilters.driftsomr}
          onChange={(vals) =>
            setSelectedFilters((prev) => ({ ...prev, driftsomr: vals }))
          }
          modes={["checkbox", "dropdown"]}
        />

        <FiltersSelect
          title="UNE"
          options={uneList}
          selected={selectedFilters.une}
          onChange={(vals) =>
            setSelectedFilters((prev) => ({ ...prev, une: vals }))
          }
          modes={["checkbox", "dropdown"]}
        />

        <FiltersSelect
          title="Tested"
          options={testedList}
          selected={selectedFilters.tested}
          onChange={(vals) =>
            setSelectedFilters((prev) => ({ ...prev, tested: vals }))
          }
          modes={["checkbox"]} // Only checkbox mode, no dropdown
        />
      </div>
      <div className="overflow-x-auto" onContextMenu={handleContextMenu}>
        {/* Pinned table */}
        {pinnedIds.length > 0 && (
          <div className="h-64 overflow-y-scroll mb-4 border border-gray-300 rounded [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-500">
            <div className="flex justify-end p-2">
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick={() => unpinAll(pinnedIds)}
              >
                Unpin All
              </button>
            </div>
            <table className="min-w-full text-sm table-fixed border-collapse">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr>
                  {columns.map((label, i) => {
                    if (!visibleColumns.has(label)) return null;
                    const key = columnKeyMap[label];
                    const isSorted = sortConfig.key === key;
                    return (
                      <th
                        key={i}
                        className="border px-4 py-2 whitespace-nowrap cursor-pointer hover:bg-gray-200"
                        onClick={() => {
                          if (!key) return;
                          setSortConfig((prev) => ({
                            key,
                            direction:
                              prev.key === key && prev.direction === "asc"
                                ? "desc"
                                : "asc",
                          }));
                        }}
                      >
                        {label}
                        {isSorted && (
                          <span className="ml-1">
                            {sortConfig.direction === "asc" ? "🔼" : "🔽"}
                          </span>
                        )}
                      </th>
                    );
                  })}
                  <th className="border px-4 py-2">📌</th>
                </tr>
              </thead>
              <tbody>
                {pinnedRows.map((row) => (
                  <TestTableRow
                    key={`pin-${row.id}`}
                    row={row}
                    isPinned={true}
                    onTogglePin={togglePin}
                    onClick={() => onSelectRow(row)}
                    visibleColumns={visibleColumns}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Main scrollable table */}
        <div className="max-h-[400px] overflow-y-scroll border-t border-gray-300 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-500">
          <table className="min-w-full text-sm table-fixed border-collapse">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                {columns.map((label, i) => {
                  if (!visibleColumns.has(label)) return null;
                  const key = columnKeyMap[label];
                  const isSorted = sortConfig.key === key;
                  return (
                    <th
                      key={i}
                      className="border px-4 py-2 whitespace-nowrap cursor-pointer hover:bg-gray-200"
                      onClick={() => {
                        if (!key) return;
                        setSortConfig((prev) => ({
                          key,
                          direction:
                            prev.key === key && prev.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                      }}
                    >
                      {label}
                      {isSorted && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "🔼" : "🔽"}
                        </span>
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
                  isPinned={isPinned(row.id)}
                  onTogglePin={togglePin}
                  onClick={() => onSelectRow(row)}
                  visibleColumns={visibleColumns}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white shadow-lg rounded-lg py-2 z-50 min-w-[200px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-2 border-b border-gray-200">
            <button
              className="w-full text-left text-blue-600 bg-gray-100 hover:text-blue-800"
              onClick={() => {
                showAllColumns();
              }}
            >
              Show All Columns
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-500">
            {columns.map((column) => (
              <label
                key={column}
                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={visibleColumns.has(column)}
                  onChange={() => toggleColumnVisibility(column)}
                />
                {column}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestTable;

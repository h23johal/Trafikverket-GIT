import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useStatusData } from "../context/StatusDataContext";
import { isOverdue } from "../hooks/overdueChecker";
import { usePinnedRows } from "../context/PinnedRowsContext";
import FiltersSelect from "./FiltersSelect";
import { TrafikverketResult } from "@/type/trafikverket";
import { TriStateMap, FiltersState } from "@/type/filters";
import { PathModal } from "./PathModal";
import Button from "./Button";

interface TestTableProps {
  onSelectRow: (row: TrafikverketResult) => void;
}

// Move TestTableRow outside and memoize it
const TestTableRow = React.memo<{
  row: TrafikverketResult;
  isPinned: boolean;
  isSticky?: boolean;
  stickyOffset?: number;
  onTogglePin: (id: string) => void;
  onClick?: () => void;
  visibleColumns: Set<string>;
  className?: string;
}>(
  ({
    row,
    isPinned,
    isSticky = false,
    stickyOffset = 0,
    onTogglePin,
    onClick,
    visibleColumns,
    className = "",
  }) => {
    const shouldHighlightRed = isOverdue(row);

    const getDaysUntilColor = (days: number | null) => {
      if (days === null) return "bg-slate-100 dark:bg-slate-700";
      if (days < -30)
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200";
      if (days < 0)
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200";
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "Färdigtestad":
          return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200";
        case "Delvis testad":
          return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200";
        case "Planerad":
          return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200";
        case "Otilldelad":
          return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
        default:
          return "bg-white dark:bg-gray-800";
      }
    };

    return (
      <tr
        className={`${
          isPinned
            ? shouldHighlightRed
              ? "bg-red-100 dark:bg-red-900"
              : "bg-sky-100 dark:bg-sky-900"
            : shouldHighlightRed
            ? "bg-red-300 dark:bg-red-800 border-red-300 dark:border-red-700"
            : ""
        } ${isSticky ? "sticky" : ""} z-20 ${className}`}
        style={isSticky ? { top: `${(stickyOffset ?? 0) * 48 + 40}px` } : {}}
      >
        {visibleColumns.has("ID") && (
          <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100">
            {row.id}
          </td>
        )}
        {visibleColumns.has("SDMS UNE ID") && (
          <td
            className={`border border-gray-200 dark:border-gray-700 px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-900 dark:text-gray-100`}
            onClick={onClick}
            title="Klicka för att visa detaljer"
          >
            {row.une_id_raw}
          </td>
        )}
        {visibleColumns.has("Bandel") && (
          <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100">
            {row.bandel}
          </td>
        )}
        {visibleColumns.has("Status") && (
          <td
            className={`border border-gray-200 dark:border-gray-700 px-2 py-1 font-medium text-center ${getStatusColor(
              row.status
            )} text-gray-900 dark:text-gray-100`}
          >
            {row.status}
          </td>
        )}
        {visibleColumns.has("Tested") && (
          <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100">
            {row.tested_date
              ? new Date(row.tested_date).toLocaleDateString()
              : "-"}
          </td>
        )}
        {visibleColumns.has("Last Test") && (
          <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100">
            {row.last_previous_test
              ? new Date(row.last_previous_test).toLocaleDateString()
              : ""}
          </td>
        )}
        {visibleColumns.has("Planned 2025") && (
          <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100">
            {row.planned_date
              ? new Date(row.planned_date).toLocaleDateString()
              : ""}
          </td>
        )}
        {visibleColumns.has("Next Test") && (
          <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100">
            {row.next_test_date
              ? new Date(row.next_test_date).toLocaleDateString()
              : ""}
          </td>
        )}
        {visibleColumns.has("Days Until") && (
          <td
            className={`border border-gray-200 dark:border-gray-700 px-2 py-1 text-center ${getDaysUntilColor(
              row.days_until
            )} text-gray-900 dark:text-gray-100`}
          >
            {row.days_until ?? "-"}
          </td>
        )}
        {visibleColumns.has("Km From") && (
          <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100">
            {row.km_from}
          </td>
        )}
        {visibleColumns.has("Km To") && (
          <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100">
            {row.km_to}
          </td>
        )}
        {visibleColumns.has("Length") && (
          <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100">
            {row.total_length_km}
          </td>
        )}
        <td className="px-2 py-1 text-center">
          <button
            className="border-none text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1 transition-all duration-200 hover:[box-shadow:inset_0_0_6px_#bbb] dark:hover:shadow-none"
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
  }
);

TestTableRow.displayName = "TestTableRow";

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
  }, [data, selectedFilters, sortConfig]);

  const pinnedRows = useMemo(() => {
    if (!data) return [];
    return data.filter((row) => pinnedIds.includes(row.id));
  }, [data, pinnedIds]);

  useEffect(() => {
    if (pinnedIds.length && data?.length) {
      console.log("Pinned rows uppdateras efter båda är redo.");
    }
  }, [pinnedIds, data]);

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

  // Memoized callbacks to prevent unnecessary re-renders
  const handleRowClick = useCallback(
    (row: TrafikverketResult) => {
      onSelectRow(row);
    },
    [onSelectRow]
  );

  const handleTogglePin = useCallback(
    (id: string) => {
      togglePin(id);
    },
    [togglePin]
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <div className="grid grid-cols-1 h-full md:grid-cols-6 gap-3 mb-2">
        <FiltersSelect
          title="Status"
          options={statusList}
          selected={selectedFilters.status}
          onChange={(vals) =>
            setSelectedFilters((prev) => ({ ...prev, status: vals }))
          }
          modes={["checkbox", "dropdown"]}
          showSearch={false}
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
        {/* Pinned table with individual row async rendering */}
        <div
          className={`transition-all duration-500 overflow-hidden ${
            pinnedIds.length > 0
              ? "max-h-[400px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
          style={{ marginBottom: pinnedIds.length > 0 ? "1rem" : 0 }}
        >
          {pinnedIds.length > 0 && (
            <div className="h-64 overflow-y-scroll border border-gray-300 dark:border-gray-600 rounded [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700">
              <div className="flex justify-end p-2">
                <Button
                  onClick={() => unpinAll(pinnedIds)}
                  variant="danger"
                  size="sm"
                >
                  Unpin All
                </Button>
              </div>
              <table className="min-w-full text-sm table-fixed border-collapse">
                <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 z-10">
                  <tr>
                    {columns.map((label, i) => {
                      if (!visibleColumns.has(label)) return null;
                      const key = columnKeyMap[label];
                      const isSorted = sortConfig.key === key;
                      return (
                        <th
                          key={i}
                          className="border border-gray-200 dark:border-gray-600 px-4 py-2 whitespace-nowrap cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 transition-all duration-200"
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
                    <th className="px-4 py-2 text-gray-900 dark:text-gray-100">
                      📌
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pinnedRows.map((row) => (
                    <AsyncTableRow
                      key={`pin-${row.id}`}
                      row={row}
                      isPinned={true}
                      onTogglePin={handleTogglePin}
                      onClick={() => handleRowClick(row)}
                      visibleColumns={visibleColumns}
                      columns={columns}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Main scrollable table */}
        <div className="max-h-[400px] overflow-y-scroll border-t border-gray-300 dark:border-gray-600 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-500 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500">
          <table className="min-w-full text-sm table-fixed border-collapse">
            <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 z-10">
              <tr>
                {columns.map((label, i) => {
                  if (!visibleColumns.has(label)) return null;
                  const key = columnKeyMap[label];
                  const isSorted = sortConfig.key === key;
                  return (
                    <th
                      key={i}
                      className="border border-gray-200 dark:border-gray-600 px-4 py-2 whitespace-nowrap cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 transition-all duration-200"
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
                <th className="px-4 py-2 text-gray-900 dark:text-gray-100">
                  📌
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row) => (
                <TestTableRow
                  key={row.id}
                  row={row}
                  isPinned={isPinned(row.id)}
                  onTogglePin={handleTogglePin}
                  onClick={() => handleRowClick(row)}
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
          className="fixed bg-white dark:bg-gray-800 shadow-2xl rounded-xl py-2 z-50 min-w-[160px] max-w-xs border border-gray-200 dark:border-gray-700"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <div className="px-4 py-2 text-base font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
            Kolumnvisning
          </div>
          {columns.map((column) => (
            <button
              key={column}
              className="w-full bg-white dark:bg-gray-800 text-left px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-200"
              onClick={() => toggleColumnVisibility(column)}
            >
              {visibleColumns.has(column) ? "✓" : "○"} {column}
            </button>
          ))}
          <div className="border-t dark:bg-gray-800 border-gray-200 dark:border-gray-700 mt-2 pt-2 px-2">
            <button
              className="w-full text-left px-4 py-2 dark:bg-gray-800 text-sm font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
              onClick={showAllColumns}
            >
              Visa alla kolumner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

type AsyncTableRowProps = {
  row: any;
  isPinned: boolean;
  onTogglePin: (id: any) => void;
  onClick: () => void;
  visibleColumns: Set<string>;
  columns: string[];
};

const AsyncTableRow: React.FC<AsyncTableRowProps> = ({
  row,
  isPinned,
  onTogglePin,
  onClick,
  visibleColumns,
  columns,
}) => {
  const [isReady, setIsReady] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), Math.random() * 100 + 50);
    return () => clearTimeout(timer);
  }, []);

  // Handle removal animation
  React.useEffect(() => {
    if (!isPinned && isReady) {
      setIsRemoving(true);
      const timer = setTimeout(() => {
        // This will trigger the parent to remove the row
      }, 300); // Match the transition duration
      return () => clearTimeout(timer);
    }
  }, [isPinned, isReady]);

  if (!isReady) {
    return (
      <tr className="animate-pulse opacity-0 transform translate-y-2 transition-all duration-300 ease-out">
        {columns.map((label: string, i: number) => {
          if (!visibleColumns.has(label)) return null;
          return (
            <td
              key={i}
              className="border border-gray-200 dark:border-gray-700 px-4 py-2"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
            </td>
          );
        })}
        <td className="px-2 py-1 text-center">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-600 rounded mx-auto"></div>
        </td>
      </tr>
    );
  }

  return (
    <TestTableRow
      row={row}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
      onClick={onClick}
      visibleColumns={visibleColumns}
      className={`transition-all duration-300 ease-out ${
        isRemoving
          ? "opacity-0 transform -translate-y-2 scale-95"
          : "opacity-100 transform translate-y-0 scale-100"
      }`}
    />
  );
};

export default TestTable;

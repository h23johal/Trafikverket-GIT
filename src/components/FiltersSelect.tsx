import React, { useState, useMemo } from "react";
import { TriStateMap, TriState } from "@/type/filters";

type FilterSelectProps = {
  title: string;
  options: string[];
  selected: TriStateMap;
  onChange: (newSelected: TriStateMap) => void;
  modes: ("checkbox" | "dropdown")[];
  className?: string;
  showSearch?: boolean;
};

const FiltersSelect: React.FC<FilterSelectProps> = ({
  title,
  options,
  selected,
  onChange,
  modes,
  className = "",
  showSearch = true,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const isDropdown = modes.includes("dropdown");
  const isCheckbox = modes.includes("checkbox");

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    return options.filter((option) => {
      // Convert option to string safely
      const optionString = String(option);
      return optionString.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [options, searchTerm]);

  const toggleOption = (option: string) => {
    const current = selected[option];

    const next: TriState =
      current === "include"
        ? "exclude"
        : current === "exclude"
        ? undefined
        : "include";

    const newSelected = { ...selected };
    if (next === undefined) {
      delete newSelected[option];
    } else {
      newSelected[option] = next;
    }

    onChange(newSelected);
  };

  const handleReset = () => {
    onChange({});
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleToggleDropdown = () => {
    if (open) {
      setSearchTerm(""); // Clear search when closing
      setHighlightedIndex(-1);
    }
    setOpen((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          toggleOption(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1); // Reset highlight when typing
  };

  const checkboxList = (
    <div
      className={`${
        isDropdown
          ? "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow rounded mt-1 max-h-64 overflow-auto text-left [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-500 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500"
          : "grid gap-2"
      } w-full`}
    >
      {isDropdown && (
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
          {/* Search input - only show if showSearch is true */}
          {showSearch && (
            <div className="mb-2 pt-2 px-4">
              <input
                type="text"
                placeholder="Sök..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                autoFocus
              />
            </div>
          )}
          {/* Reset button and count */}
          <div className="flex justify-between items-center px-4 pb-2">
            {showSearch && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {filteredOptions.length} av {options.length}
              </span>
            )}
            <button
              className="text-xs px-3 py-1.5 rounded-lg font-medium border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={handleReset}
              type="button"
            >
              Reset
            </button>
          </div>
        </div>
      )}
      {filteredOptions.length > 0 ? (
        filteredOptions.map((option, index) => (
          <label
            key={option}
            className={`block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100 transition-all duration-200 ${
              index === highlightedIndex ? "bg-blue-100 dark:bg-blue-900" : ""
            }`}
          >
            <span
              onClick={() => toggleOption(option)}
              className={`inline-block w-3 h-3 mr-2 rounded border border-gray-400 dark:border-gray-500 cursor-pointer ${
                selected[option] === "include"
                  ? "bg-green-400 dark:bg-green-500"
                  : selected[option] === "exclude"
                  ? "bg-red-400 dark:bg-red-500"
                  : "bg-gray-200 dark:bg-gray-600"
              }`}
              title={
                selected[option] === "include"
                  ? "Inkluderad"
                  : selected[option] === "exclude"
                  ? "Exkluderad"
                  : "Neutral"
              }
            />
            {option}
          </label>
        ))
      ) : (
        <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
          Inga resultat för "{searchTerm}"
        </div>
      )}
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {isDropdown ? (
        <>
          <button
            className="btn-overlay text-white p-2 border border-slate-600 dark:border-slate-500 rounded-lg w-full text-left bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-600 dark:to-slate-700 shadow-lg hover:shadow-xl flex items-center justify-between relative hover:from-slate-700 hover:to-slate-800 dark:hover:from-slate-500 dark:hover:to-slate-600 transition-all duration-200 ease-in-out border transition-colors"
            onClick={handleToggleDropdown}
          >
            <span>{title}</span>
            {Object.keys(selected).length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 dark:bg-red-500 rounded-full absolute right-2 top-2">
                {Object.keys(selected).length}
              </span>
            )}
          </button>
          {/* Animated dropdown container */}
          <div
            className={`absolute top-full left-0 right-0 z-20 transition-all duration-300 ease-out overflow-hidden ${
              open
                ? "max-h-96 opacity-100 transform translate-y-0"
                : "max-h-0 opacity-0 transform -translate-y-2"
            }`}
          >
            {checkboxList}
          </div>
        </>
      ) : (
        <button
          className="btn-overlay text-white p-2 border border-slate-600 dark:border-slate-500 rounded-lg w-full text-left bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-600 dark:to-slate-700 shadow-lg hover:shadow-xl flex items-center justify-between hover:from-slate-700 hover:to-slate-800 dark:hover:from-slate-500 dark:hover:to-slate-600 transition-all duration-200 ease-in-out border transition-colors"
          onClick={() => toggleOption(options[0])}
        >
          {title}
          <span
            className={`inline-block w-3 h-3 rounded border border-gray-400 dark:border-gray-500 ${
              selected[options[0]] === "include"
                ? "bg-green-400 dark:bg-green-500"
                : selected[options[0]] === "exclude"
                ? "bg-red-400 dark:bg-red-500"
                : "bg-gray-200 dark:bg-gray-600"
            }`}
            title={
              selected[options[0]] === "include"
                ? "Inkluderad"
                : selected[options[0]] === "exclude"
                ? "Exkluderad"
                : "Neutral"
            }
          />
        </button>
      )}
    </div>
  );
};

export default FiltersSelect;

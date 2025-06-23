import React, { useState } from "react";
import { TriStateMap, TriState } from "@/type/filters";

type FilterSelectProps = {
  title: string;
  options: string[];
  selected: TriStateMap;
  onChange: (newSelected: TriStateMap) => void;
  modes: ("checkbox" | "dropdown")[];
  className?: string;
};

const FiltersSelect: React.FC<FilterSelectProps> = ({
  title,
  options,
  selected,
  onChange,
  modes,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const isDropdown = modes.includes("dropdown");
  const isCheckbox = modes.includes("checkbox");

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

  const checkboxList = (
    <div
      className={`${
        isDropdown
          ? "absolute z-20 bg-white border shadow rounded mt-1 max-h-64 overflow-auto text-left [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-500"
          : "grid gap-2"
      } w-full`}
    >
      {isDropdown && (
        <div className="px-4 py-2 border-b flex justify-end">
          <button
            className="text-xs text-blue-600 hover:underline bg-gray-100 rounded px-2 py-1"
            onClick={() => onChange({})}
            type="button"
          >
            Reset
          </button>
        </div>
      )}
      {options.map((option) => (
        <label key={option} className="block px-4 py-2 hover:bg-gray-100">
          <span
            onClick={() => toggleOption(option)}
            className={`inline-block w-3 h-3 mr-2 rounded border border-gray-400 cursor-pointer ${
              selected[option] === "include"
                ? "bg-green-400"
                : selected[option] === "exclude"
                ? "bg-red-400"
                : "bg-gray-200"
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
      ))}
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {isDropdown ? (
        <>
          <button
            className="text-white p-2 border rounded w-full text-left bg-blue-600 shadow flex items-center justify-between relative"
            onClick={() => setOpen((prev) => !prev)}
          >
            <span>{title}</span>
            {Object.keys(selected).length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full absolute right-2 top-2">
                {Object.keys(selected).length}
              </span>
            )}
          </button>
          {open && checkboxList}
        </>
      ) : (
        <button
          className="text-white p-2 border rounded w-full text-left bg-blue-600 shadow flex items-center justify-between"
          onClick={() => toggleOption(options[0])}
        >
          {title}
          <span
            className={`inline-block w-3 h-3 rounded border border-gray-400 ${
              selected[options[0]] === "include"
                ? "bg-green-400"
                : selected[options[0]] === "exclude"
                ? "bg-red-400"
                : "bg-gray-200"
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

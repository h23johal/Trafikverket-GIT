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
          ? "absolute z-20 bg-white border shadow rounded mt-1 max-h-64 overflow-auto text-left"
          : "grid gap-2"
      } w-full`}
    >
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
            className="text-white p-2 border rounded w-full text-left bg-blue-600 shadow flex items-center justify-between"
            onClick={() => setOpen((prev) => !prev)}
          >
            {title}
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

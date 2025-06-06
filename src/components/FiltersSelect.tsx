import React, { useState } from "react";

type FilterSelectProps = {
  title: string;
  options: string[];
  selected: string[];
  onChange: (newSelected: string[]) => void;
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
    const newSelected = selected.includes(option)
      ? selected.filter((o) => o !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  const checkboxList = (
    <div className={`${isDropdown ? "absolute z-20 bg-white border shadow rounded mt-1 max-h-64 overflow-auto text-left" : "grid gap-2"} w-full`}>
      {options.map((option) => (
        <label key={option} className="block px-4 py-2 hover:bg-gray-100">
          <input
            type="checkbox"
            className="mr-2"
            checked={selected.includes(option)}
            onChange={() => toggleOption(option)}
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
        <>
          <div className="font-medium mb-1">{title}</div>
          {checkboxList}
        </>
      )}
    </div>
  );
};

export default FiltersSelect;
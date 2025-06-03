import React from "react";

const FilterControls: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <select className="p-2 border rounded">
      <option>All UNE IDs</option>
    </select>
    <select className="p-2 border rounded">
      <option>All Bandels</option>
    </select>
  </div>
);

export default FilterControls;
  
import React from "react";
import { Search as SearchIcon } from "lucide-react";

const Search = ({ showDate = false }) => {
  return (
    <div className="w-full px-4 py-3 bg-[#F3F4F6] flex items-center rounded-full justify-between gap-3">
      {/* Search Input */}
      <div
        className="flex items-center flex-1 rounded-full px-4 py-2"
        style={{ backgroundColor: "#0000000D" }}
      >
        <SearchIcon className="text-gray-400 mr-2" size={18} />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Conditional Status Button or Date Input */}
      {showDate ? (
        <input
          type="date"
          className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 outline-none w-[160px]"
          style={{ backgroundColor: "#0000000D" }}
        />
      ) : (
        <button
          className="px-4 py-2 rounded-full text-sm font-medium 
          text-gray-600 hover:bg-gray-200 transition whitespace-nowrap"
          style={{ backgroundColor: "#0000000D" }}
        >
          All Status
        </button>
      )}
    </div>
  );
};

export default Search;
import React, { useState } from "react";
import { Search as SearchIcon, ChevronDown } from "lucide-react";

const Search = ({ showDate = false, status, onStatusChange, searchValue, onSearchChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statuses = ["All status", "Pending", "Completed"];

  return (
    <div className="w-full px-4 py-3 bg-[#F3F4F6] flex items-center rounded-full justify-between gap-3 relative">
      {/* Search Input */}
      <div
        className="flex items-center flex-1 rounded-full px-4 py-2"
        style={{ backgroundColor: "#0000000D" }}
      >
        <SearchIcon className="text-gray-400 mr-2" size={18} />
        <input
          type="text"
          placeholder="Search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
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
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 rounded-full text-sm font-medium 
            text-gray-600 hover:bg-gray-200 transition whitespace-nowrap flex items-center gap-2"
            style={{ backgroundColor: "#0000000D" }}
          >
            {status || "All status"}
            <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onStatusChange(s);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-between"
                >
                  {s}
                  {(status === s || (!status && s === "All status")) && (
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
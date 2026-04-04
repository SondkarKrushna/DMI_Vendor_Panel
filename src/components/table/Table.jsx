import React, { useState } from 'react';

const Table = ({
  columns,
  data,
  onRowSelect,
  onSelectAll,
  selectedRows = [],
  isLoading = false
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = data ? [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortConfig.direction === 'asc'
      ? aValue - bValue
      : bValue - aValue;
  }) : [];

  return (
    <div className="w-full rounded-[24px] bg-white overflow-hidden shadow-sm border border-gray-100">
      <div className="overflow-x-auto thin-scrollbar">
        <table className="w-full text-left border-collapse">
          {/* 🔥 HEADER */}
          <thead>
            <tr 
              className="text-white"
              style={{ background: "linear-gradient(to right, #2a0030, #7E1080)" }}
            >
              {/* Checkbox */}
              <th className="px-6 py-4 first:rounded-l-[24px]">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-white/40 bg-white/20 accent-[#FAB800]"
                  onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                />
              </th>

              {columns.map((col, index) => (
                <th
                  key={col.accessor}
                  onClick={() => handleSort(col.accessor)}
                  className={`px-4 py-4 text-xs font-semibold cursor-pointer whitespace-nowrap uppercase tracking-wider ${index === columns.length - 1 ? 'last:rounded-r-[24px]' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* 🔥 BODY */}
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-20 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-[#7E1080] border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-20 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              sortedData.map((row, i) => (
                <tr
                  key={i}
                  className="bg-white hover:bg-gray-50 transition-all border-b border-gray-50 last:border-0"
                >
                  {/* Checkbox */}
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 accent-[#7E1080]"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => onRowSelect && onRowSelect(row.id)}
                    />
                  </td>

                  {columns.map((col) => (
                    <td
                      key={col.accessor}
                      className="px-4 py-4 text-sm text-gray-700 font-medium whitespace-nowrap"
                    >
                      {col.Cell
                        ? col.Cell({ row, value: row[col.accessor] })
                        : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
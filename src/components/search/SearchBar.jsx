import React from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({
    value,
    onChange,
    placeholder = "Search...",
    filters = [],
    actions = [],
}) => {
    return (
        <div className="w-full bg-white my-4 rounded-xl sm:rounded-2xl shadow-sm px-3 sm:px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-4 border-gray-100">

            {/* 🔍 Search Input */}
            <div className="flex items-center gap-2 bg-gray-50 sm:bg-gray-100 rounded-xl px-4 py-2 w-full md:max-w-[300px] lg:max-w-[400px]">
                <FiSearch className="text-gray-400 text-lg shrink-0" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="bg-transparent outline-none w-full text-sm"
                />
            </div>

            {/* 🎛 Filters + Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">

                {/* Filters */}
                {filters.map((filter, index) => (
                    filter.render ? (
                        <div key={index} className="flex-1 sm:flex-none">
                            {filter.render()}
                        </div>
                    ) : (
                        <select
                            key={index}
                            value={filter.value}
                            onChange={(e) => filter.onChange(e.target.value)}
                            className="px-3 sm:px-4 py-2 rounded-xl bg-gray-50 sm:bg-gray-100 text-sm outline-none flex-1 sm:flex-none min-w-[120px]"
                        >
                            {filter.options.map((opt, i) => (
                                <option key={i} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    )
                ))}

                {/* Actions (buttons) */}
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={action.onClick}
                        className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition flex-1 sm:flex-none whitespace-nowrap text-center ${action.variant === 'primary'
                            ? 'bg-[var(--color-brand-purple)] text-white'
                            : action.variant === 'secondary'
                                ? 'bg-gray-200'
                                : 'bg-[var(--color-brand-yellow)] text-white'
                            }`}
                    >
                        {action.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SearchBar;
import React from 'react';

/**
 * Standardized Pagination Component for DMI Vendor Panel
 * @param {Object} pagination - Pagination object from API response
 * @param {Function} onPageChange - Callback for page switching
 */
const Pagination = ({ pagination, onPageChange }) => {
  // Hide if no pagination data or only one page
  const totalPages = pagination?.pages || pagination?.total_pages || 1;
  const totalRecords = pagination?.total || 0;
  const perPage = pagination?.per_page || pagination?.limit || 10;
  const currentPage = pagination?.page || 1;

  if (!pagination || (totalRecords <= perPage && totalPages <= 1)) {
    return null;
  }

  const hasPrev = pagination?.has_prev_page !== undefined ? pagination.has_prev_page : currentPage > 1;
  const hasNext = pagination?.has_next_page !== undefined ? pagination.has_next_page : currentPage < totalPages;

  return (
    <div className="flex flex-col items-center justify-center gap-4 mt-10 mb-8 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => onPageChange(currentPage - 1)}
          className={`px-6 py-2.5 rounded-xl border-2 transition-all flex items-center gap-2 font-bold text-sm
            ${!hasPrev
              ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-200 hover:border-[#7E1080] hover:text-[#7E1080] hover:shadow-md active:scale-95"
            }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </button>

        <div className="flex items-center gap-2 bg-gray-50/50 px-4 py-2.5 rounded-xl border border-gray-100 shadow-inner">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Page</span>
          <span className="text-lg font-black text-[#7E1080] min-w-[1.5rem] text-center leading-none">{currentPage}</span>
          <span className="text-gray-300 mx-1">/</span>
          <span className="text-sm font-bold text-gray-600">{totalPages}</span>
        </div>

        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onPageChange(currentPage + 1)}
          className={`px-6 py-2.5 rounded-xl border-2 transition-all flex items-center gap-2 font-bold text-sm
            ${!hasNext
              ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-200 hover:border-[#7E1080] hover:text-[#7E1080] hover:shadow-md active:scale-95"
            }`}
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-[1px] w-8 bg-gray-100"></div>
        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em] italic">
          Showing <span className="text-gray-600">{(currentPage - 1) * perPage + 1}</span> to <span className="text-gray-600">{Math.min(currentPage * perPage, totalRecords)}</span> of <span className="text-[#7E1080] underline decoration-purple-200 underline-offset-4">{totalRecords}</span> entries
        </p>
        <div className="h-[1px] w-8 bg-gray-100"></div>
      </div>
    </div>
  );
};

export default Pagination;

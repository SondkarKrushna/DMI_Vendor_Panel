import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { IoMdClose } from 'react-icons/io';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = 'max-w-md',
  footer,
  disableBackdropClick = false,
  ariaLabelledBy = 'modal-title',
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed font-dm-sans inset-0 z-1000 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Backdrop */}
      {!disableBackdropClick && (
        <div className="absolute inset-0 w-full h-full" onClick={onClose} />
      )}

      {/* Modal Panel */}
      <div
        className={`bg-white rounded-3xl h-full shadow-2xl w-full relative z-1001 flex flex-col overflow-hidden border border-gray-100 ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 id={ariaLabelledBy} className="text-xl font-bold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-600 hover:rotate-90"
            aria-label="Close modal"
          >
            <IoMdClose size={20} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mx-6" />

        {/* Body */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto custom-scrollbar flex flex-col gap-4">
          {children}
        </div>

        {/* Footer (optional external actions) */}
        {footer && (
          <div className="px-6 pb-6 pt-2 flex justify-end items-center gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   Reusable form building blocks
──────────────────────────────────────────── */

/** Generic field wrapper with label */
export const FormField = ({ label, children, className = '' }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    {children}
  </div>
);

/** Text / number input */
export const FormInput = ({ placeholder = 'Enter', type = 'text', ...rest }) => (
  <input
    type={type}
    placeholder={placeholder}
    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#7E1080] focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all"
    {...rest}
  />
);

/** Select dropdown */
export const FormSelect = ({ children, ...rest }) => (
  <select
    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400 outline-none focus:border-[#7E1080] focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all appearance-none cursor-pointer"
    {...rest}
  >
    {children}
  </select>
);

/** Textarea */
export const FormTextarea = ({ placeholder = 'Enter', rows = 4, ...rest }) => (
  <textarea
    rows={rows}
    placeholder={placeholder}
    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#7E1080] focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all resize-none"
    {...rest}
  />
);

/** Image upload box */
export const FormImageUpload = ({ label = 'Image' }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <label className="flex flex-col items-center justify-center gap-2 w-full h-28 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:border-[#7E1080] hover:bg-purple-50/30 transition-all group">
      <svg className="w-7 h-7 text-gray-300 group-hover:text-[#7E1080] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-xs text-gray-400 group-hover:text-[#7E1080] transition-colors font-medium">Click to Upload</span>
      <input type="file" accept="image/*" className="hidden" />
    </label>
  </div>
);

/** Brand submit button — the CTA at bottom of modal */
export const ModalSubmitBtn = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-50 py-3.5 mt-2 rounded-xl mx-auto font-semibold text-sm text-white bg-[linear-gradient(180deg,#7E1080_0%,#1A031A_100%)] shadow-lg shadow-purple-200 hover:opacity-90 active:scale-[.98] transition-all flex items-center justify-center gap-2"
  >
    {children}
  </button>
);

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  footer: PropTypes.node,
  disableBackdropClick: PropTypes.bool,
  ariaLabelledBy: PropTypes.string,
};

export default Modal;
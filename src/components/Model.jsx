import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, ChevronDown, Upload, Image as ImageIcon } from 'lucide-react';
import { PulseLoader } from 'react-spinners';

/**
 * ══════════════════════════════════════════════════
 * PREMIUM MODAL COMPONENT (v2.0)
 * ══════════════════════════════════════════════════
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = 'max-w-md',
  footer,
  disableBackdropClick = false,
  noScroll = false,
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
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop with premium blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={!disableBackdropClick ? onClose : undefined}
      />

      {/* Modal Panel with Entry Animation */}
      <div
        className={`bg-white rounded-[2rem] shadow-2xl w-full relative z-[1001] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300 ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
      >
        {/* Header - Sleek & Modern */}
        <div className="flex items-center justify-between px-8 pt-4 pb-2">
          <h2 id={ariaLabelledBy} className="text-xl font-bold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Subtle Gradient Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-8" />

        {/* Body - Comfortable Spacing & Custom Scrollbar */}
        <div className={`px-8 py-6 flex flex-col gap-5 ${!noScroll ? 'max-h-[75vh] overflow-y-auto custom-scrollbar' : ''}`}>
          {children}
        </div>

        {/* Footer - Optional external actions */}
        {footer && (
          <div className="px-8 pb-8 pt-2 flex justify-end items-center gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ══════════════════════════════════════════════════
 * REUSABLE FORM COMPONENTS (PREMIUM UI)
 * ══════════════════════════════════════════════════
 */

/** Generic field wrapper with label and integrated error display */
export const FormField = ({ label, children, error, required, className = '' }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {label && (
      <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative">
      {children}
    </div>
    {error && (
      <p className="text-[11px] font-bold text-red-500 ml-1 animate-in slide-in-from-top-1">
        {error}
      </p>
    )}
  </div>
);

/** Professional Input Styling - Rebuilt for maximum visibility */
export const FormInput = ({ placeholder = 'Enter...', error, ...rest }) => (
  <input
    className={`w-full px-5 py-3.5 rounded-2xl border bg-white text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 shadow-sm
      ${error
        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50'
        : 'border-gray-200 focus:border-[#7E1080] focus:ring-4 focus:ring-purple-50'
      }
    `}
    {...rest}
    placeholder={placeholder}
  />
);

/** Professional Select Styling with Custom Icon */
export const FormSelect = ({ children, error, ...rest }) => (
  <div className="relative group">
    <select
      className={`w-full px-5 py-3.5 rounded-2xl border bg-white text-sm outline-none transition-all duration-200 appearance-none cursor-pointer shadow-sm
        ${error
          ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-50'
          : 'border-gray-200 text-gray-700 focus:border-[#7E1080] focus:ring-4 focus:ring-purple-50'
        }
      `}
      {...rest}
    >
      {children}
    </select>
    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">
      <ChevronDown size={18} />
    </div>
  </div>
);

/** Professional Textarea Styling */
export const FormTextarea = ({ placeholder = 'Tell us more...', rows = 3, error, ...rest }) => (
  <textarea
    rows={rows}
    className={`w-full px-5 py-4 rounded-2xl border bg-white text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 resize-none shadow-sm
      ${error
        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50'
        : 'border-gray-200 focus:border-[#7E1080] focus:ring-4 focus:ring-purple-50'
      }
    `}
    {...rest}
    placeholder={placeholder}
  />
);

/** Redesigned Image Upload with Preview Support */
export const FormImageUpload = ({ label = 'Upload Image', error, previewUrl, onChange, ...rest }) => (
  <div className="flex flex-col gap-2">
    {label && <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>}

    <label className={`relative flex flex-col items-center justify-center gap-2 w-full h-28 rounded-[1.5rem] border-2 border-dashed cursor-pointer overflow-hidden transition-all duration-200 group
      ${error
        ? 'border-red-300 bg-red-50/30'
        : previewUrl
          ? 'border-purple-200 bg-white shadow-sm'
          : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-[#7E1080] shadow-sm'
      }
    `}>
      {previewUrl ? (
        <>
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
            <Upload size={24} className="text-white" />
            <span className="text-xs text-white font-bold">Change Image</span>
          </div>
        </>
      ) : (
        <>
          <div className="w-9 h-9 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-[#7E1080] group-hover:scale-110 transition-all duration-300">
            <Upload size={24} />
          </div>
          <div className="text-center">
            <span className="text-sm text-gray-600 font-bold block">Choose a file</span>
            <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-1">PNG, JPG or WebP (Max 5MB)</span>
          </div>
        </>
      )}
      <input type="file" accept="image/*" className="hidden" onChange={onChange} {...rest} />
    </label>

    {error && <p className="text-[11px] font-bold text-red-500 ml-1">{error}</p>}
  </div>
);

/** Premium Brand Submit Button */
export const ModalSubmitBtn = ({ children, onClick, disabled, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-4 mt-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-[#7E1080] to-[#1A031A] shadow-xl shadow-purple-100 hover:shadow-purple-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${className}`}
  >
    {disabled && <PulseLoader size={8} color="#fff" />}
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
  noScroll: PropTypes.bool,
  ariaLabelledBy: PropTypes.string,
};

export default Modal;
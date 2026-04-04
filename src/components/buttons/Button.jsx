import React from "react";

const Button = ({
  text = "Add Offer",
  onClick,
  icon: Icon, 
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl 
      bg-gradient-to-b from-[#7E1080] to-[#1A031A] 
      text-white font-semibold shadow-md 
      hover:scale-105 hover:shadow-lg 
      active:scale-95 transition-all duration-200 text-sm sm:text-base ${className}`}
    >
      {/* ✅ Show custom icon if passed, else fallback to + */}
      {Icon ? (
        <Icon size={18} />
      ) : (
        <span className="text-lg font-bold">+</span>
      )}

      {text}
    </button>
  );
};

export default Button;
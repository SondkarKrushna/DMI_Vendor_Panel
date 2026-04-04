import React from "react";
import { Bell, ChevronDown, Menu } from "lucide-react";

const Header = ({ toggleSidebar }) => {
  return (
    <div className="w-full bg-white px-4 py-3 flex items-center justify-between">
      
      {/* Left Side: Mobile Toggle and Notifications */}
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle - Visible only on mobile */}
        <button 
          onClick={toggleSidebar}
          className="text-gray-700 hover:bg-gray-100 p-2 rounded-md transition xl:hidden"
        >
          <Menu size={24} />
        </button>

        <button
          className="flex items-center gap-2 text-white px-4 py-2 rounded-full shadow-md hover:opacity-90 transition"
          style={{
            background: "linear-gradient(to right, #7E1080, #1A031A)",
          }}
        >
          <div className="relative flex items-center justify-center w-5 h-5">
            <Bell size={18} />
            <span className="absolute top-[1px] right-[2px] w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
          </div>
          <span className="hidden sm:inline">Notifications</span>
        </button>
      </div>

      {/* Right Side Items Container */}
      <div className="flex items-center gap-4">
        {/* User Profile Section */}
        <div
          className="flex items-center gap-3 text-white px-4 py-2 rounded-full shadow-md cursor-pointer hover:opacity-90 transition"
          style={{
            background: "linear-gradient(to right, #7E1080, #1A031A)",
          }}
        >
          {/* Avatar */}
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 text-black font-bold">
            TI
          </div>

          {/* User Info */}
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-semibold">Vendor User</span>
            <span className="text-xs opacity-80">Techspark It</span>
          </div>

          {/* Dropdown Icon */}
          <ChevronDown className="hidden lg:block" size={18} />
        </div>
      </div>
    </div>
  );
};

export default Header;
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../../public/images/logo.png";

import {
  LayoutDashboard,
  Tag,
  Settings,
  DollarSign,
  UserPlus,
  CreditCard,
  Phone,
  User,
  Megaphone,
  Users,
  Briefcase,
  HelpCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> },
    { name: "Offers Management", path: "/offers", icon: <Tag size={18} /> },
    { name: "Service Management", path: "/services", icon: <Settings size={18} /> },
    { name: "Payments & Invoices", path: "/invoice", icon: <DollarSign size={18} /> },
    { name: "Enrollment & Billing", path: "/enrolling", icon: <UserPlus size={18} /> },
    { name: "Cardholder Punch", path: "/card-holder", icon: <CreditCard size={18} /> },
    { name: "Call note Pad", path: "/call-notepad", icon: <Phone size={18} /> },
  ];

  const otherMenus = [
    { name: "Punch Management", path: "/punch-management", icon: <User size={18} /> },
    { name: "Advertisements", path: "/advertisements", icon: <Megaphone size={18} /> },
    { name: "Affiliation program", path: "/affilation", icon: <Users size={18} /> },
    { name: "Business Profile", path: "/business-profile", icon: <Briefcase size={18} /> },
    { name: "Support", path: "/support", icon: <HelpCircle size={18} /> },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 xl:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Wrapper */}
      <div
        className={`fixed xl:relative top-0 left-0 text-white z-50 overflow-hidden transform transition-all duration-300 
          ${isSidebarOpen ? "translate-x-0 w-72 h-full" : "-translate-x-full w-0 h-full"}
          xl:translate-x-0 ${isDesktopOpen ? "xl:w-72" : "xl:w-20"}
          xl:my-4 xl:ml-3 xl:h-[calc(100vh-32px)] xl:rounded-[24px]
        `}
        style={{
          background: "linear-gradient(to bottom, #7E1080, #1A031A)",
        }}
      >
        <div className={`h-full flex flex-col transition-all duration-300 ${isDesktopOpen ? "w-72" : "xl:w-20 w-72"} pt-3 xl:pt-1`}>
          {/* Logo */}
          <div onClick={() => navigate("/")} className={`pt-1 pb-1 cursor-pointer transition-all duration-300 ${isDesktopOpen ? "pl-6 pr-3" : "xl:px-0 pl-6 pr-3"}`}>
            <div className={`relative bg-white/95 flex items-center shadow-md transition-all duration-300 mx-auto
                ${isDesktopOpen ? "rounded-2xl px-4 py-2.5 gap-4" : "xl:rounded-xl xl:w-12 xl:h-12 xl:justify-center xl:p-0 xl:gap-0 rounded-2xl px-4 py-2.5 gap-4"}
            `}>
              {/* Toggle Button explicitly nested on the card border */}
              <div
                className="hidden xl:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#EAB308] rounded-full items-center justify-center cursor-pointer text-black z-50 shadow-md"
                onClick={(e) => { e.stopPropagation(); setIsDesktopOpen(!isDesktopOpen); }}
              >
                {isDesktopOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </div>

              <div className={`bg-white rounded-xl border flex flex-shrink-0 items-center justify-center transition-all duration-300 ${isDesktopOpen ? "w-14 h-14" : "xl:w-12 xl:h-12 w-14 h-14"}`}>
                <img src={logo} alt="Logo" className={`object-contain transition-all duration-300 ${isDesktopOpen ? "w-8 h-" : "xl:w-8 xl:h-8 w-10 h-10"}`} />
              </div>

              <div className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isDesktopOpen ? "opacity-100 max-w-[200px]" : "xl:opacity-0 xl:max-w-0 opacity-100 max-w-[200px]"}`}>
                <p className="text-base font-semibold text-black">Decode Me India</p>
                <p className="text-sm text-gray-500">Admin User</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden pb-4 mt-2">
            {/* General Menu */}
            <div className="px-4">
              <p className={`text-yellow-400 text-sm mb-1 whitespace-nowrap transition-all duration-300 ${!isDesktopOpen ? "xl:opacity-0 xl:h-0 xl:overflow-hidden xl:m-0" : "opacity-100 h-auto"}`}>GENERAL MENU</p>
              <div className={`hidden border-t border-yellow-500 my-1 mx-2 transition-all duration-300 ${!isDesktopOpen ? "xl:block" : ""}`}></div>

              {menuItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 1280) toggleSidebar();
                  }}
                  className={`flex items-center cursor-pointer transition-all duration-300 
                    ${isDesktopOpen ? "rounded-md gap-3 pl-6 pr-3 w-full py-1.5 mb-[3px]" : "xl:rounded-[12px] rounded-md xl:w-10 xl:h-10 xl:mx-auto xl:justify-center xl:px-0 xl:gap-0 gap-3 pl-6 pr-3 w-full py-1.5 mb-[3px] xl:mb-0 xl:py-0"}
                    ${isActive(item.path) ? "bg-white text-[#7E1080] font-bold shadow-sm" : "hover:bg-[#7E1080]/40 text-white/90"}
                  `}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  <span className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${!isDesktopOpen ? "xl:w-0 xl:opacity-0" : "w-40 opacity-100"}`}>{item.name}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className={`border-t border-yellow-500 my-2 mx-4 opacity-50 transition-all ${!isDesktopOpen ? "xl:my-2" : "xl:my-2"}`}></div>

            {/* Other Menu */}
            <div className="px-4">
              <p className={`text-yellow-400/80 text-[11px] font-bold tracking-wider mb-1.5 whitespace-nowrap transition-all duration-500 ${!isDesktopOpen ? "xl:opacity-0 xl:h-0 xl:overflow-hidden xl:m-0" : "opacity-100 h-auto ml-2"}`}>OTHER MENU'S</p>

              {otherMenus.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 1280) toggleSidebar();
                  }}
                  className={`flex items-center cursor-pointer transition-all duration-300 
                    ${isDesktopOpen ? "rounded-md gap-3 pl-6 pr-3 w-full py-1.5 mb-[3px]" : "xl:rounded-[12px] rounded-md xl:w-10 xl:h-10 xl:mx-auto xl:justify-center xl:px-0 xl:gap-0 gap-3 pl-6 pr-3 w-full py-1.5 mb-[3px] xl:mb-0 xl:py-0"}
                    ${isActive(item.path) ? "bg-white text-[#7E1080] font-bold shadow-sm" : "hover:bg-[#7E1080]/40 text-white/90"}
                  `}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  <span className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${!isDesktopOpen ? "xl:w-0 xl:opacity-0" : "w-40 opacity-100"}`}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
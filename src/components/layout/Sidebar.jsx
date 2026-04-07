import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import {
  MdKeyboardArrowRight,
  MdClose
} from 'react-icons/md';
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
  HelpCircle
} from "lucide-react";

const Sidebar = React.memo(({ isSidebarOpen, toggleSidebar }) => {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleToggleCollapse = () => {
    setIsDesktopOpen(!isDesktopOpen);
  };

  const generalLinks = [
    { to: '/dashboardadvert', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/offers', icon: <Tag size={20} />, label: 'Offers Management' },
    { to: '/services', icon: <Settings size={20} />, label: 'Service Management' },
    { to: '/invoice', icon: <DollarSign size={20} />, label: 'Payments & Invoices' },
    { to: '/enrolling', icon: <UserPlus size={20} />, label: 'Enrollment & Billing' },
    { to: '/card-holder', icon: <CreditCard size={20} />, label: 'Cardholder Punch' },
    { to: '/call-notepad', icon: <Phone size={20} />, label: 'Call note Pad' },
  ];

  const otherLinks = [
    { to: '/punch-management', icon: <User size={20} />, label: 'Punch Management' },
    { to: '/advertisements', icon: <Megaphone size={20} />, label: 'Advertisements' },
    { to: '/affilation', icon: <Users size={20} />, label: 'Affiliation program' },
    { to: '/business-profile', icon: <Briefcase size={20} />, label: 'Business Profile' },
    { to: '/support', icon: <HelpCircle size={20} />, label: 'Support' },
  ];

  const NavItem = ({ to, icon, label, badge }) => {
    return (
      <NavLink
        to={to}
        end={to === '/'}
        data-tooltip-id={!isDesktopOpen ? "sidebar-tooltip" : undefined}
        data-tooltip-content={!isDesktopOpen ? label : undefined}
        data-tooltip-place="right"
        onClick={() => {
          if (window.innerWidth < 1280 && isSidebarOpen) toggleSidebar();
        }}
        className={({ isActive }) => `
          flex items-center gap-3 py-2.5 transition-all duration-200 group relative
          ${!isDesktopOpen ? 'justify-center px-0 mx-2 rounded-xl' : 'px-4 mx-2 rounded-xl'}
          ${isActive
            ? 'bg-white text-[#7E1080] shadow-md'
            : 'text-white/80 hover:text-white hover:bg-white/10'}
        `}
      >
        <div className="shrink-0 transition-transform group-hover:scale-110">
          {icon}
        </div>
        {isDesktopOpen && (
          <span className="font-medium text-[13px] whitespace-nowrap tracking-wide">
            {label}
          </span>
        )}

        {badge && (
          <span className={`absolute bg-red-500 rounded-full border-2 border-[#7E1080]
            ${!isDesktopOpen ? 'right-2 top-2 w-2.5 h-2.5' : 'right-3 top-1/2 -translate-y-1/2 w-2 h-2'}
          `} />
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-[60] xl:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={toggleSidebar}
      />

      <aside
        className={`
          fixed xl:relative shrink-0 m-3 bg-gradient-to-b from-[#7E1080] to-[#2D062D] z-[70] transition-all duration-300 ease-in-out
          flex flex-col shadow-2xl rounded-[2rem] border border-white/10
          ${!isDesktopOpen ? 'w-[75px]' : 'w-[240px]'}
          h-[calc(100vh-24px)]
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[110%] xl:translate-x-0'}
        `}
      >
        {/* Desktop Toggle Arrow */}
        <button
          onClick={handleToggleCollapse}
          className="hidden xl:flex absolute -right-2.5 top-10 w-8 h-8 bg-[#FAB800] rounded-full items-center justify-center text-black shadow-lg cursor-pointer z-[80] hover:scale-110 transition-transform"
        >
          <MdKeyboardArrowRight size={24} className={!isDesktopOpen ? '' : 'rotate-180'} />
        </button>

        {/* Logo Section */}
        <div className={`pt-3 pb-3 transition-all duration-300 ${!isDesktopOpen ? 'px-1' : 'px-3'}`}>
          <div className={`bg-white rounded-2xl shadow-inner flex items-center transition-all duration-300 overflow-hidden ${!isDesktopOpen ? 'justify-center p-2 h-12 w-12 mx-auto' : 'gap-3 px-3 py-2.5 h-14'
            }`}>
            <div className={`shrink-0 flex items-center justify-center transition-all duration-300 ${!isDesktopOpen ? 'w-8' : 'w-16'
              }`}>
              <img src="/images/logo.png" alt="Logo" className="w-full h-auto object-contain" />
            </div>

            {isDesktopOpen && (
              <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="font-bold text-gray-900 text-[13px] whitespace-nowrap leading-tight">
                  Decode Me India
                </span>
                <span className="text-gray-500 text-[11px] font-medium">
                  Admin User
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Scroll Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col pt-2">

          {/* General Menu */}
          <div className="mb-4">
            {isDesktopOpen && (
              <h3 className="px-4 mb-2 text-[#FAB800] font-bold text-[11px] tracking-[0.15em] uppercase opacity-80">
                General Menu
              </h3>
            )}
            <nav className="flex flex-col">
              {generalLinks.map((link) => (
                <NavItem key={link.to} {...link} />
              ))}
            </nav>
          </div>

          {/* Divider */}
          <div className="mb-4">
            <div className="h-[1px] bg-[#FAB800] w-full" />
          </div>

          {/* Other Menus */}
          <div className="pb-8">
            {isDesktopOpen && (
              <h3 className="px-4 mb-2 text-[#FAB800] font-bold text-[11px] tracking-[0.15em] uppercase opacity-80">
                Other Menu's
              </h3>
            )}
            <nav className="flex flex-col">
              {otherLinks.map((link) => (
                <NavItem key={link.to} {...link} />
              ))}
            </nav>
          </div>
        </div>

        {/* Optional: Close button for mobile inside the sidebar */}
        <button
          onClick={toggleSidebar}
          className="xl:hidden absolute top-2 right-2 text-white/50 p-2"
        >
          <MdClose size={20} />
        </button>
      </aside>

      {/* Tooltip Styling */}
      {!isDesktopOpen && (
        <Tooltip
          id="sidebar-tooltip"
          className="z-[100] !bg-[#1A031A] !text-[12px] !font-semibold !rounded-lg !px-4 !py-2 !shadow-xl"
          classNameArrow="!border-[#1A031A]"
        />
      )}
    </>
  );
});

export default Sidebar;
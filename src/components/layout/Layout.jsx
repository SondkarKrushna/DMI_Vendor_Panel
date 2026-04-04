import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* Sidebar - Position and state managed inside Sidebar component */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Section */}
      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* Header (Sticky Top) */}
        <div className="sticky top-0 z-40">
          <Header toggleSidebar={toggleSidebar} />
        </div>

        {/* Page Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto bg-white p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
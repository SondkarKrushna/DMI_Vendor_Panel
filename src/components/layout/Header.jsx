import React, { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, Menu, User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLogoutVendorMutation } from "../../redux/api/authapi";
import { useDispatch } from "react-redux";
import { authApi } from "../../redux/api/authapi";
import { useGetProfileQuery } from "../../redux/api/profileApi";
import NotificationsModal from "../notifications/NotificationsModal";

const Header = ({ toggleSidebar }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutVendor, { isLoading }] = useLogoutVendorMutation();

  const { data, isLoading: profileLoading } = useGetProfileQuery();

  const profile = data?.profile;


  // console.log("PROFILE DATA:", data);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutVendor().unwrap();

      // ✅ clear storage
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      // ✅ clear RTK cache
      dispatch(authApi.util.resetApiState());

      // ✅ redirect
      navigate("/login");

    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="w-full bg-white px-4 py-3 flex items-center justify-between">

      {/* Left Side: Mobile Toggle and Notifications */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-gray-700 hover:bg-gray-100 p-2 rounded-md transition xl:hidden"
        >
          <Menu size={24} />
        </button>

        <button
          onClick={() => setShowNotifications(true)}
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

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Profile Section */}
        <div
          ref={profileRef}
          onClick={() => setShowProfile(!showProfile)}
          className="relative flex items-center gap-3 text-white px-4 py-2 rounded-full shadow-md cursor-pointer transition"
          style={{
            background: "linear-gradient(to right, #7E1080, #1A031A)",
          }}
        >
          {/* Avatar */}
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 text-black font-bold overflow-hidden">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profile?.fullName?.charAt(0)?.toUpperCase() || "U"
            )}
          </div>


          {/* User Info */}
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-semibold">
              {profileLoading ? "Loading..." : profile?.fullName}
            </span>
            <span className="text-xs opacity-80 capitalize">
              {profile?.role}
            </span>
          </div>


          {/* Dropdown Icon */}
          <ChevronDown className="hidden lg:block" size={18} />

          {/* Profile Dropdown */}
          {showProfile && (
            <div
              className="absolute right-0 top-full mt-3 w-72 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50 bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="p-5 text-white"
                style={{ background: "linear-gradient(to right, #7E1080, #1A031A)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-[#7E1080] shadow-sm text-lg font-bold overflow-hidden">
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      profile?.fullName?.charAt(0)?.toUpperCase() || "U"
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">
                      {profile?.fullName}
                    </h2>
                    <p className="text-xs opacity-80 truncate w-40">
                      {profile?.email}
                    </p>
                  </div>
                </div>

              </div>

              {/* Actions */}
              <div className="p-2 flex flex-col gap-1">

                {/* My Profile */}
                <button
                  onClick={() => navigate("/business-profile")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
                  bg-white text-gray-700 
                  hover:bg-purple-50 active:bg-purple-50
                  hover:text-[#7E1080] active:text-[#7E1080]
                  transition-all duration-200 group">

                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 
                  group-hover:bg-[#7E1080] group-active:bg-[#7E1080]
                  group-hover:text-white group-active:text-white
                  transition-all duration-200 shadow-sm">
                    <User size={18} />            
                  </div>

                  <span className="text-sm font-semibold">My Profile</span>
                </button>


                {/* Account Settings */}
                {/* <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
    bg-white text-gray-700 
    hover:bg-blue-50 active:bg-blue-50
    hover:text-blue-600 active:text-blue-600
    transition-all duration-200 group">

                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 
      group-hover:bg-blue-600 group-active:bg-blue-600
      group-hover:text-white group-active:text-white
      transition-all duration-200 shadow-sm">
                    <Settings size={18} />
                  </div>

                  <span className="text-sm font-semibold">Account Settings</span>
                </button> */}


                {/* Notifications */}
                {/* <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
    bg-white text-gray-700 
    hover:bg-orange-50 active:bg-orange-50
    hover:text-orange-600 active:text-orange-600
    transition-all duration-200 group">

                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 
      group-hover:bg-orange-600 group-active:bg-orange-600
      group-hover:text-white group-active:text-white
      transition-all duration-200 shadow-sm">
                    <Bell size={18} />
                  </div>

                  <span className="text-sm font-semibold">Notifications</span>
                </button> */}

                <div className="my-2 border-t border-gray-100"></div>


                {/* Logout */}
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
      bg-white text-gray-700 
      hover:bg-red-50 active:bg-red-50
      hover:text-red-600 active:text-red-600
      transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 
      group-hover:bg-red-600 group-active:bg-red-600
      group-hover:text-white group-active:text-white
      transition-all duration-200 shadow-sm">
                    <LogOut size={18} />
                  </div>

                  <span className="text-sm font-semibold">
                    {isLoading ? "Logging out..." : "Logout"}
                  </span>
                </button>

              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Account Status</span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold capitalize">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  {profile?.status}
                </span>
              </div>

            </div>
          )}
        </div>
      </div>
      {/* Notifications Modal */}
      <NotificationsModal 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  );
};

export default Header;
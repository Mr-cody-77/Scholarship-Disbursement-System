import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Settings,
  Users,
  GraduationCap,
  Building,
  UserPlus,
  BookOpen,
  BarChart2,
  LogOut,
  Menu,
  X,
  History,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { auth } from "../../Firebase";
import { signOut } from "firebase/auth";

const AdminSidebar = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for dropdowns, active link, sidebar visibility
  const [dropdownOpen, setDropdownOpen] = useState({
    documentStatus: true,
    scholarshipInfo: false,
    userManagement: false,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);

  // Check screen size and update sidebar mode
  useEffect(() => {
    const checkScreenSize = () => {
      // Mobile view: sidebar hidden by default
      if (window.innerWidth < 768) {
        setIsCompactMode(false);
        setIsSidebarOpen(false);
      } 
      // Desktop view: check if screen is small
      else if (window.innerWidth < 1024) {
        setIsCompactMode(true);
        setIsSidebarOpen(false);
      } 
      // Large desktop: full sidebar
      else {
        setIsCompactMode(false);
        setIsSidebarOpen(true);
      }
    };

    // Check initial screen size
    checkScreenSize();

    // Add event listener for resizing
    window.addEventListener('resize', checkScreenSize);

    // Cleanup listener
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleDropdown = (section) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Signout error:", e);
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isItemActive = (item) => {
    if (!item.path) return false;
    return location.pathname === item.path || location.pathname.startsWith(item.path + "/");
  };

  const items = [
    {
      name: "Applications Scrutiny",
      icon: GraduationCap,
      path: "/admin-dashboard",
    },
    {
      name: "Scrutiny History",
      icon: History,
      path: "/admin-history",
    },
  ];

  const convertToNameFormat = (text) =>
    text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  // Listen for mobile menu toggle from TopBar
  useEffect(() => {
    const handleToggle = () => setIsSidebarOpen((prev) => !prev);
    window.addEventListener("toggle-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-sidebar", handleToggle);
  }, []);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 top-14 sm:top-16 bg-slate-950/60 backdrop-blur-2xs z-30"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:relative top-14 sm:top-16 md:top-0 bottom-0 left-0 z-30
          w-64 bg-slate-900 text-white 
          h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] md:h-full p-4 overflow-y-auto 
          border-r border-slate-800/80 shadow-xl md:shadow-none
          transition-transform duration-300 ease-in-out flex flex-col flex-shrink-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Close Button for Mobile/Compact Mode */}
        {(isSidebarOpen || isCompactMode) && (
          <div 
            className="absolute top-4 right-4 cursor-pointer"
            onClick={toggleSidebar}
          >
            <X size={24} />
          </div>
        )}

        {/* User Profile Section */}
        <div className="flex items-center mb-4 p-2 border-b border-gray-700/60">
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 font-bold text-xs flex items-center justify-center mr-3 shadow-xs">
            {props.user?.fullName?.[0]?.toUpperCase() || "A"}
          </div>
          <div className={isCompactMode ? 'hidden' : 'truncate'}>
            <p className="font-semibold text-xs text-slate-100 truncate">
              {convertToNameFormat(props.user?.fullName || "Institutional Nodal Officer")}
            </p>
            <p className="text-[10px] text-gray-400 tracking-wide uppercase font-medium">
              AISHE Institutional Scrutiny
            </p>
          </div>
        </div>

        <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index}>
            <NavLink
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsSidebarOpen(false);
                }
              }}
              className={`
                flex items-center py-2.5 px-3 rounded-xl cursor-pointer text-sm font-medium transition
                ${isItemActive(item) ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-gray-800 text-slate-300"}
                ${isCompactMode ? 'justify-center' : ''}
              `}
            >
              <item.icon size={18} className={isCompactMode ? "" : "mr-3 flex-shrink-0 text-blue-400"} />
              <span className={`text-sm ${isCompactMode ? 'hidden' : ''}`}>
                {item.name}
              </span>
            </NavLink>
          </div>
        ))}
        </div>

        {/* Logout Button Container */}
        <div className={`mt-4 bg-gray-700/60 rounded-lg ${isCompactMode ? 'text-center' : ''}`}>
          <div
            className={`
              flex items-center py-2 px-3 rounded cursor-pointer 
              hover:bg-red-600 transition duration-200 text-xs text-red-200
              ${isCompactMode ? 'justify-center' : ''}
            `}
            onClick={handleLogout}
          >
            <LogOut size={16} className={isCompactMode ? "" : "mr-2.5"} />
            <span className={`text-xs font-semibold ${isCompactMode ? 'hidden' : ''}`}>
              Logout
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
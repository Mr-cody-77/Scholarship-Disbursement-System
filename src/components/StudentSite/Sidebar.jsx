import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Settings,
  Users,
  GraduationCap,
  Building,
  UserPlus,
  BookOpen,
  Home,
  BarChart2,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { auth } from "../../Firebase";
import { signOut } from "firebase/auth";

const Sidebar = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State management
  const [dropdownOpen, setDropdownOpen] = useState({
    documentStatus: false,
    scholarshipInfo: false,
    userManagement: false,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);

  // Screen size and responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setIsCompactMode(false);
        setIsSidebarOpen(false);
      } else if (window.innerWidth < 1024) {
        setIsCompactMode(true);
        setIsSidebarOpen(false);
      } else {
        setIsCompactMode(false);
        setIsSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
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

  const items = [
    { name: "Dashboard", icon: Home, path: "/home" },
    { name: "Available Scholarships", icon: Building, path: "/viewScholarships" },
    { name: "My Applications", icon: BarChart2, path: "/updatedDashboard" },
    { name: "Application Tracker", icon: GraduationCap, path: "/track" },
    { name: "Biometric e-KYC", icon: UserPlus, path: "/ekyc0" },
    { name: "Help & FAQ", icon: BookOpen, path: "/faq" },
    { name: "Logout", icon: LogOut, action: handleLogout }
  ];

  const isItemActive = (item) => {
    if (!item.path) return false;
    if (item.path === "/home") {
      return location.pathname === "/home" || location.pathname === "/dashboard";
    }
    return location.pathname === item.path || location.pathname.startsWith(item.path + "/");
  };

  const convertToNameFormat = (text) =>
    text
      ? text
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "";

  // Sidebar variants for animation
  const sidebarVariants = {
    closed: { 
      width: isCompactMode ? '5rem' : '0',
      transition: { 
        duration: 0.3,
        type: "tween"
      }
    },
    open: { 
      width: isCompactMode ? '5rem' : '16rem',
      transition: { 
        duration: 0.3,
        type: "tween"
      }
    }
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.3 
      }
    }
  };

  // Listen for mobile menu toggle from TopBar
  useEffect(() => {
    const handleToggle = () => setIsSidebarOpen((prev) => !prev);
    window.addEventListener("toggle-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-sidebar", handleToggle);
  }, []);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 top-14 sm:top-16 bg-slate-950/60 backdrop-blur-2xs z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:relative top-14 sm:top-16 md:top-0 bottom-0 left-0 z-30
          bg-slate-900 text-white h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] md:h-full
          border-r border-slate-800/80 shadow-xl md:shadow-none
          transition-transform duration-300 ease-in-out flex flex-col flex-shrink-0
          w-64
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* User Profile Section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={menuItemVariants}
          className="flex items-center mb-4 p-3.5 border-b border-gray-700/60"
        >
          <div className="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 font-bold text-xs flex items-center justify-center mr-3 shadow-xs">
            {props.user?.fullName?.[0]?.toUpperCase() || "S"}
          </div>
          <div className={isCompactMode ? 'hidden' : 'truncate'}>
            <p className="font-bold text-xs text-slate-100 truncate">
              {convertToNameFormat(props.user.fullName || "Scholar")}
            </p>
            <p className="text-[10px] text-slate-400 tracking-wide uppercase font-medium">
              {props.user.role === "student" ? "ST Scholar" : "Administrator"}
            </p>
          </div>
        </motion.div>

        {/* Menu Items */}
        <div className="flex-grow overflow-hidden">
        <div className="h-full overflow-y-auto sidebar-scroll px-2 space-y-1">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div 
                  key={index}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                  transition={{ delay: index * 0.05 }}
                >
                  <motion.div
                    onClick={() => {
                      if (item.dropdown) {
                        toggleDropdown(item.name);
                      } else if (item.action) {
                        item.action();
                      }
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.15 }
                    }}
                  >
                    <NavLink
                      to={item.path || "#"}
                      onClick={() => {
                        if (window.innerWidth < 768 && !item.dropdown) {
                          setIsSidebarOpen(false);
                        }
                      }}
                      className={`
                        flex items-center py-2.5 px-3 rounded-xl cursor-pointer 
                        transition duration-200 text-sm font-medium
                        ${isItemActive(item)
                          ? "bg-blue-600 text-white font-semibold shadow-sm" 
                          : "hover:bg-slate-800 text-slate-300"}
                        ${isCompactMode ? 'justify-center' : ''}
                        ${item.name === 'Logout' ? 'hover:bg-red-600/80 text-red-300 mt-2' : ''}
                      `}
                    >
                      <item.icon size={18} className={isCompactMode ? "" : "mr-3 flex-shrink-0"} />
                      <span 
                        className={`text-sm ${isCompactMode ? 'hidden' : ''}`}
                      >
                        {item.name}
                      </span>
                      {item.dropdown && !isCompactMode && 
                        (dropdownOpen[item.name] ? (
                          <ChevronUp size={14} className="ml-auto" />
                        ) : (
                          <ChevronDown size={14} className="ml-auto" />
                        ))
                      }
                    </NavLink>
                  </motion.div>

                  {/* Dropdown Submenu */}
                  <AnimatePresence>
                    {item.dropdown && dropdownOpen[item.name] && !isCompactMode && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ 
                          opacity: 1, 
                          height: 'auto',
                          transition: { duration: 0.3 }
                        }}
                        exit={{ 
                          opacity: 0, 
                          height: 0,
                          transition: { duration: 0.2 }
                        }}
                        className="ml-8 mt-1"
                      >
                        {item.dropdown.map((subItem, subIndex) => (
                          <motion.div 
                            key={subIndex}
                            whileHover={{ 
                              scale: 1.05,
                              transition: { duration: 0.2 }
                            }}
                          >
                            <NavLink
                              to={subItem.path}
                              className={({ isActive }) =>
                                `py-2 px-4 rounded-lg cursor-pointer 
                                text-sm block transition duration-300 ease-in-out
                                ${isActive 
                                  ? "bg-blue-500 text-white" 
                                  : "hover:bg-gray-700 text-gray-300"}`
                              }
                            >
                              {subItem.name}
                            </NavLink>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;